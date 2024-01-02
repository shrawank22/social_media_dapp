// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract SocialMediaContract {
    event AddPost(address indexed recipient, uint indexed postId, bool indexed isPaid);
    event DeletePost(uint indexed postId, bool isDeleted);
    event TipPost(address indexed sender, uint indexed postId, uint tipAmount);

    using Counters for Counters.Counter;
    Counters.Counter private postCounter;
    Counters.Counter private commentCounter;
    Counters.Counter private reportCounter;

    // struct Post {
    //     uint id;
    //     address payable username;
    //     string postText;
    //     bool isPaid;
    //     uint viewPrice;
    //     bool isDeleted;
    // }
    enum Visibility { Public, FollowersOnly, Private }
    enum NotificationType { NewFollower, NewComment, PostLiked, PostReported }

    struct Notification {
        NotificationType notificationType;
        address fromUser;
        uint associatedPostId;
        string additionalInfo;
    }

    // Define a Profile struct
    struct Profile {
        string name;
        string bio;
        string profileImageLink;
    }

    struct Post {
        uint id;
        address payable username;
        string postText;
        bool isPaid;
        uint viewPrice;
        bool isDeleted;
        uint likes; // Added likes field
        uint dislikes; // Added dislikes field
        mapping(address => bool) likedBy; // To keep track of who liked the post
        mapping(address => bool) dislikedBy; // To keep track of who disliked the post
        Visibility visibility;
        string[] tags;
    }

    struct Comment {
        uint id;
        address payable commenter;
        uint postId;
        string commentText;
    }

    struct Report {
        uint id;
        address reporter;
        uint postId;
        string reason;
    }

    // Mapping for assigning id to each Post
    mapping(uint256 => Post) posts;

    // Mapping to connect comments with posts
    mapping(uint256 => Comment) comments;
    mapping(uint256 => Comment[]) postToComments;

    // Create a mapping to connect reports with posts
    mapping(uint256 => Report) reports;
    mapping(uint256 => Report[]) postToReports;

    // Maintain a mapping to store followers and following lists for each user
    mapping(address => address[]) public followers;
    mapping(address => address[]) public following;

    // Maintain a mapping to store blocked users for each user
    mapping(address => mapping(address => bool)) public blockedBy;

    // For Notifications
    mapping(address => Notification[]) public userNotifications;

    // For Profile
    mapping(address => Profile) public userProfiles;


    function addPost(string memory _postText, bool _isPaid, uint _viewPrice) external payable {
        postCounter.increment();
        uint256 postId = postCounter.current();

        Post storage newPost = posts[postId];
        newPost.id = postId;
        newPost.username = payable(msg.sender);
        newPost.postText = _postText;
        newPost.isPaid = _isPaid;
        newPost.viewPrice = _viewPrice;
        newPost.isDeleted = false;
        emit AddPost(msg.sender, postId, _isPaid);
    }

    function editPost(uint _postId, string memory _newPostText) external {
        require(posts[_postId].username == msg.sender, "You are not the owner of the post");
        require(!posts[_postId].isDeleted, "Post is deleted");

        posts[_postId].postText = _newPostText;
    }

    function changePostVisibility(uint _postId, Visibility _visibility) external {
        require(posts[_postId].username == msg.sender, "You are not the owner of the post");
        posts[_postId].visibility = _visibility;
    }

    function canViewPost(uint _postId, address _user) external view returns (bool) {
        if (posts[_postId].visibility == Visibility.Public) {
            return true;
        }
        if (posts[_postId].visibility == Visibility.Private && posts[_postId].username == _user) {
            return true;
        }
        // Add logic for FollowersOnly when you have a followers system in place
        return false;
    }


    function viewPaidPost(uint postId) external payable {
        require(posts[postId].isPaid, "Post is not paid");
        uint viewPrice = posts[postId].viewPrice;

        payable(posts[postId].username).transfer(viewPrice);

        emit TipPost(msg.sender, postId, msg.value);
    }

    function getpostDetails(uint256 postId) external view returns (uint256, address, string memory, bool, uint256, bool) {
        Post storage post = posts[postId];
        return (
            post.id,
            post.username,
            post.postText,
            post.isPaid,
            post.viewPrice,
            post.isDeleted
        );
    }

    // function getAllposts() external view returns (Post[] memory) {
    //     uint counter = 0;
    //     for (uint i = 1; i <= postCounter.current(); i++) {
    //         if (!posts[i].isDeleted) {
    //             counter++;
    //         }
    //     }

    //     Post[] memory result = new Post[](counter);
    //     uint resultIndex = 0;
    //     for (uint i = 1; i <= postCounter.current(); i++) {
    //         if (!posts[i].isDeleted) {
    //             result[resultIndex] = posts[i];
    //             resultIndex++;
    //         }
    //     }

    //     return result;
    // }


    // function getMyposts() external view returns (Post[] memory) {
    //     uint counter = 0;
    //     for (uint id = 1; id <= postCounter.current(); id++) {
    //         if (posts[id].username == msg.sender && !posts[id].isDeleted) {
    //             counter++;
    //         }
    //     }

    //     Post[] memory result = new Post[](counter);
    //     uint resultIndex = 0;
    //     for (uint id = 1; id <= postCounter.current(); id++) {
    //         if (posts[id].username == msg.sender && !posts[id].isDeleted) {
    //             result[resultIndex] = posts[id];
    //             resultIndex++;
    //         }
    //     }
    //     return result;
    // }


    function deletePost(uint postId) external {
        require(posts[postId].username == msg.sender, "You are not the owner of the post");
        posts[postId].isDeleted = true;
        emit DeletePost(postId, true);
    }

    function tipPost(uint postId, uint tipAmnt) external payable {
        require(!posts[postId].isDeleted, "post is deleted");
        require(tipAmnt > 0, "Invalid tip amount");
        require(posts[postId].username != msg.sender, "You cannot tip your own post");

        posts[postId].username.transfer(tipAmnt);
        emit TipPost(msg.sender, postId, tipAmnt);
    }

    // function searchPostsByUser(address _user) external view returns (Post[] memory) {
    //     uint counter = 0;
    //     for (uint i = 1; i <= postCounter.current(); i++) {
    //         if (posts[i].username == _user && !posts[i].isDeleted) {
    //             counter++;
    //         }
    //     }

    //     Post[] memory result = new Post[](counter);
    //     uint resultIndex = 0;
    //     for (uint i = 1; i <= postCounter.current(); i++) {
    //         if (posts[i].username == _user && !posts[i].isDeleted) {
    //             result[resultIndex] = posts[i];
    //             resultIndex++;
    //         }
    //     }
    //     return result;
    // }

    function reportPost(uint _postId, string memory _reason) external {
        require(!posts[_postId].isDeleted, "Post is deleted");

        reportCounter.increment();
        uint256 reportId = reportCounter.current();

        Report memory newReport;
        newReport.id = reportId;
        newReport.reporter = msg.sender;
        newReport.postId = _postId;
        newReport.reason = _reason;

        reports[reportId] = newReport;
        postToReports[_postId].push(newReport);
    }

    function viewReports(uint _postId) external view returns (Report[] memory) {
        return postToReports[_postId];
    }




    // Comments Part
    function addComment(uint _postId, string memory _commentText) external {
        require(!posts[_postId].isDeleted, "Post is deleted");

        commentCounter.increment();
        uint256 commentId = commentCounter.current();

        Comment memory newComment;
        newComment.id = commentId;
        newComment.commenter = payable(msg.sender);
        newComment.postId = _postId;
        newComment.commentText = _commentText;

        comments[commentId] = newComment;
        postToComments[_postId].push(newComment);
    }

    function viewComments(uint _postId) external view returns (Comment[] memory) {
        return postToComments[_postId];
    }

    function followUser(address _userToFollow) external {
        require(_userToFollow != msg.sender, "You cannot follow yourself");
        require(!isFollowing(msg.sender, _userToFollow), "You are already following this user");

        following[msg.sender].push(_userToFollow);
        followers[_userToFollow].push(msg.sender);
    }

    function unfollowUser(address _userToUnfollow) external {
        require(isFollowing(msg.sender, _userToUnfollow), "You are not following this user");

        _removeFromFollowing(msg.sender, _userToUnfollow);
        _removeFromFollowers(_userToUnfollow, msg.sender);
    }

    function isFollowing(address _follower, address _following) public view returns (bool) {
        for (uint i = 0; i < following[_follower].length; i++) {
            if (following[_follower][i] == _following) {
                return true;
            }
        }
        return false;
    }

    function _removeFromFollowing(address _follower, address _following) private {
        uint index;
        for (uint i = 0; i < following[_follower].length; i++) {
            if (following[_follower][i] == _following) {
                index = i;
                break;
            }
        }
        if (index < following[_follower].length - 1) {
            following[_follower][index] = following[_follower][following[_follower].length - 1];
        }
        following[_follower].pop();
    }

    function _removeFromFollowers(address _following, address _follower) private {
        uint index;
        for (uint i = 0; i < followers[_following].length; i++) {
            if (followers[_following][i] == _follower) {
                index = i;
                break;
            }
        }
        if (index < followers[_following].length - 1) {
            followers[_following][index] = followers[_following][followers[_following].length - 1];
        }
        followers[_following].pop();
    }

    // 2. Functions for Blocking Users

    function blockUser(address _userToBlock) external {
        require(_userToBlock != msg.sender, "You cannot block yourself");
        blockedBy[msg.sender][_userToBlock] = true;
    }

    function unblockUser(address _userToUnblock) external {
        blockedBy[msg.sender][_userToUnblock] = false;
    }

    function isBlocked(address _user, address _blockedUser) public view returns (bool) {
        return blockedBy[_user][_blockedUser];
    }


    // Functions for Notifications

    function addNotification(address _user, NotificationType _type, address _fromUser, uint _postId, string memory _info) private {
        Notification memory newNotification;
        newNotification.notificationType = _type;
        newNotification.fromUser = _fromUser;
        newNotification.associatedPostId = _postId;
        newNotification.additionalInfo = _info;

        userNotifications[_user].push(newNotification);
    }

    function viewNotifications() external view returns (Notification[] memory) {
        return userNotifications[msg.sender];
    }

    function clearNotifications() external {
        delete userNotifications[msg.sender];
    }

    // Functions for User Profile Management
    function setProfile(string memory _name, string memory _bio, string memory _imageLink) external {
        Profile memory userProfile;
        userProfile.name = _name;
        userProfile.bio = _bio;
        userProfile.profileImageLink = _imageLink;

        userProfiles[msg.sender] = userProfile;
    }

    function viewProfile(address _user) external view returns (Profile memory) {
        return userProfiles[_user];
    }

    // Functions for Post Tags
    // function searchPostsByTag(string memory _tag) external view returns (Post[] memory) {
    //     uint counter = 0;
    //     for (uint i = 1; i <= postCounter.current(); i++) {
    //         if (!posts[i].isDeleted && _containsTag(posts[i].tags, _tag)) {
    //             counter++;
    //         }
    //     }

    //     Post[] memory result = new Post[](counter);
    //     uint resultIndex = 0;
    //     for (uint i = 1; i <= postCounter.current(); i++) {
    //         if (!posts[i].isDeleted && _containsTag(posts[i].tags, _tag)) {
    //             result[resultIndex] = posts[i];
    //             resultIndex++;
    //         }
    //     }
    //     return result;
    // }

    function _containsTag(string[] memory tags, string memory _tag) private pure returns (bool) {
        for (uint i = 0; i < tags.length; i++) {
            if (keccak256(abi.encodePacked(tags[i])) == keccak256(abi.encodePacked(_tag))) {
                return true;
            }
        }
        return false;
    }
}
