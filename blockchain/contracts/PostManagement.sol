// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PostManagement is ERC721 {
    uint256 public postCounter;

    // Mappings
    mapping(uint256 => DataTypes.Post) public posts;
    mapping(uint256 => mapping(address => bool)) public postReports;
    mapping(address => mapping(address => bool)) public followers;
    DataTypes.Gatekeeper[] public gatekeepers;
    mapping(address => bool) public hasAddedGatekeeper;
    mapping(uint256 => mapping(address => bool)) private reportedByUser;
    mapping(address => address[]) arrayList;
    mapping(string => DataTypes.User[]) private usersByName;

    // Events
    event AddPost(address indexed recipient, uint256 indexed postId);
    event DeletePost(uint256 indexed postId, bool isDeleted);
    event TipPost(
        address indexed sender,
        uint256 indexed postId,
        uint256 tipAmount
    );
    event LikePost(address indexed sender, uint256 indexed postId);
    event DislikePost(address indexed sender, uint256 indexed postId);
    event ViewPost(address indexed sender, uint indexed postId);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event PostReported(
        uint256 indexed postId,
        address indexed reporter,
        string reason
    );
    event NewPostForFollower(
        address indexed follower,
        address indexed sender,
        uint256 indexed postId
    );
    event ListPostEvent(
        address indexed follower,
        address indexed sender,
        uint256 indexed postId
    );
    event CancelPostEvent(
        address indexed follower,
        address indexed sender,
        uint256 indexed postId
    );
    event BuyPostEvent(
        address indexed follower,
        address indexed sender,
        uint256 indexed postId
    );
    event UserRegistered(string name, address userAddress, string imageUrl);

    constructor() ERC721("PostNFT", "PNFT") {}

    // Functions
    // Add a new post
    // function addPost(
    //     string memory _postText,
    //     uint256 _viewPrice
    // ) external payable {
    //     postCounter++;
    //     uint256 postId = postCounter;

    //     DataTypes.Post storage newPost = posts[postId];
    //     newPost.id = postId;
    //     newPost.username = payable(msg.sender);
    //     newPost.postText = _postText;
    //     newPost.viewPrice = _viewPrice;
    //     newPost.isDeleted = false;
    //     newPost.hasListed = false;
    //     newPost.listPrice = 0 ether;
    //     _mint(msg.sender, postId); // Mint a new NFT for the post

    //     emit AddPost(msg.sender, postId);

    //     address[] memory followerList = getFollowers(msg.sender);
    //     for (uint256 i = 0; i < followerList.length; i++) {
    //         address follower = followerList[i];
    //         emit NewPostForFollower(follower, msg.sender, postId);
    //     }
    // }

    function addPost(
        string memory _postText,
        uint256 _viewPrice
    ) external payable {
        postCounter++;
        uint256 postId = postCounter;

        DataTypes.Post storage newPost = posts[postId];
        newPost.id = postId;
        newPost.username = payable(msg.sender);
        newPost.postText = _postText;
        newPost.viewPrice = _viewPrice;
        newPost.isDeleted = false;
        newPost.hasListed = false;
        newPost.listPrice = 0 ether;
        _mint(msg.sender, postId); // Mint a new NFT for the post

        emit AddPost(msg.sender, postId);

        address[] memory followerList = getFollowers(msg.sender);
        address[] memory followers2 = new address[](followerList.length);

        for (uint256 i = 0; i < followerList.length; i++) {
            followers2[i] = followerList[i];
        }

        emit NewPostForFollowers(followers2, msg.sender, postId);
    }

    // New event definition
    event NewPostForFollowers(
        address[] followers,
        address indexed sender,
        uint256 indexed postId
    );

    // Edit a post
    function editPost(
        uint256 _postId,
        string memory _newPostText,
        uint256 _newPrice
    ) external {
        require(
            posts[_postId].username == msg.sender,
            "You are not the owner of the post"
        );
        require(!posts[_postId].isDeleted, "Post is deleted");

        posts[_postId].postText = _newPostText;
        posts[_postId].viewPrice = _newPrice;

        address[] memory followerList = getFollowers(msg.sender);
        for (uint256 i = 0; i < followerList.length; i++) {
            address follower = followerList[i];
            emit NewPostForFollower(follower, msg.sender, _postId);
        }
    }

    // Delete a post
    function deletePost(uint postId) external {
        require(
            posts[postId].username == msg.sender,
            "You are not the owner of the post"
        );
        posts[postId].isDeleted = true;
        emit DeletePost(postId, true);
    }

    // Get all posts
    function getAllPosts() external view returns (DataTypes.Post[] memory) {
        return _getPostsByCriteria(address(0), false);
    }

    // Get all posts by a user
    function getMyPosts() external view returns (DataTypes.Post[] memory) {
        return _getPostsByCriteria(msg.sender, false);
    }

    // get all posts created by other users that the current user follows
    function getFollowedUsersPosts()
        external
        view
        returns (DataTypes.Post[] memory)
    {
        return _getPostsByCriteria(msg.sender, true);
    }

    function registerUser(string memory name, string memory imageUrl) public {
        DataTypes.User[] storage users = usersByName[name];
        for (uint i = 0; i < users.length; i++) {
            if (users[i].userAddress == msg.sender) {
                // If user is already registered, update the imageUrl
                users[i].imageUrl = imageUrl;
                emit UserRegistered(name, msg.sender, imageUrl);
                return;
            }
        }

        // If user is not registered, add a new entry
        DataTypes.User memory newUser = DataTypes.User({
            userAddress: msg.sender,
            imageUrl: imageUrl
        });

        users.push(newUser);
        emit UserRegistered(name, msg.sender, imageUrl);
    }

    function getUsersByName(
        string memory name
    ) public view returns (DataTypes.User[] memory) {
        return usersByName[name];
    }

    // Add comment to a post
    function addComment(uint256 _postId, string memory _commentText) external {
        require(!posts[_postId].isDeleted, "Post is deleted");

        DataTypes.Comment memory newComment;
        newComment.id = posts[_postId].comments.length + 1;
        newComment.commenter = payable(msg.sender);
        newComment.commentText = _commentText;

        posts[_postId].comments.push(newComment);
    }

    // Get all comments for a post
    function getPostComments(
        uint256 _postId
    ) external view returns (DataTypes.Comment[] memory) {
        return posts[_postId].comments;
    }

    // View Paid Post
    function viewPaidPost(uint postId) external payable {
        require(!posts[postId].isDeleted, "post is deleted");
        require(
            posts[postId].username != msg.sender,
            "You cannot pay to view your own post"
        );

        posts[postId].username.transfer(msg.value);
        posts[postId].userWhoPaid.push(msg.sender);
        emit ViewPost(msg.sender, postId);
    }

    function getPaidUsersByPostId(
        uint256 postId
    ) public view returns (address[] memory) {
        return posts[postId].userWhoPaid;
    }

    // Check if a user has paid for a post
    function hasUserPaidForPost(
        uint256 postId,
        address user
    ) public view returns (bool) {
        if (posts[postId].username == user) {
            return true;
        }

        for (uint i = 0; i < posts[postId].userWhoPaid.length; i++) {
            if (posts[postId].userWhoPaid[i] == user) {
                return true;
            }
        }
        return false;
    }

    // Follow a user
    function followUser(address _user) external {
        require(_user != msg.sender, "You cannot follow yourself");
        followers[_user][msg.sender] = true;
        arrayList[_user].push(msg.sender);
    }

    // Unfollow a user
    function unfollowUser(address _user) external {
        require(_user != msg.sender, "You cannot unfollow yourself");
        followers[_user][msg.sender] = false;
    }

    function isFollowing(
        address _follower,
        address _following
    ) public view returns (bool) {
        return followers[_follower][_following];
    }
    // Like a Post
    function likePost(uint256 postId) external {
        posts[postId].likes++;
        emit PostLiked(postId, msg.sender);
    }

    // Unlike a Post
    function unlikePost(uint256 postId) external {
        require(posts[postId].likes > 0, "Post has no likes");
        posts[postId].likes--;
        emit PostUnliked(postId, msg.sender);
    }

    // Get likes for a post
    function getLikesForPost(uint256 postId) external view returns (uint256) {
        return posts[postId].likes;
    }

    // Report a post
    function reportPost(uint256 postId, string memory reason) external {
        require(
            posts[postId].username != msg.sender,
            "You cannot report your own post."
        );
        require(
            !reportedByUser[postId][msg.sender],
            "You have already reported this post."
        );

        DataTypes.Report memory report = DataTypes.Report(
            posts[postId].reports.length,
            msg.sender,
            reason
        );
        posts[postId].reports.push(report);
        reportedByUser[postId][msg.sender] = true;

        emit PostReported(postId, msg.sender, reason);
    }

    function getReportsForPost(
        uint256 postId
    ) external view returns (DataTypes.Report[] memory) {
        return posts[postId].reports;
    }

    // Add a gatekeeper
    function addGatekeeper(string memory ip, uint16 port) public {
        require(
            !hasAddedGatekeeper[msg.sender],
            "This address has already added a gatekeeper"
        );
        gatekeepers.push(DataTypes.Gatekeeper(ip, port));
        hasAddedGatekeeper[msg.sender] = true;
    }

    // Fetch gatekeepers
    function getGatekeepersCount() public view returns (uint) {
        return gatekeepers.length;
    }

    function getGatekeeper(
        uint index
    ) public view returns (string memory ip, uint16 port) {
        DataTypes.Gatekeeper memory gatekeeper = gatekeepers[index];
        return (gatekeeper.ip, gatekeeper.port);
    }

    // Helper functions
    function _getPostsByCriteria(
        address _user,
        bool onlyFollowed
    ) private view returns (DataTypes.Post[] memory) {
        uint256 counter = 0;
        for (uint256 i = 1; i <= postCounter; i++) {
            if (
                !posts[i].isDeleted &&
                (_user == address(0) ||
                    posts[i].username == _user ||
                    (onlyFollowed && followers[msg.sender][posts[i].username]))
            ) {
                counter++;
            }
        }

        DataTypes.Post[] memory postDataArray = new DataTypes.Post[](counter);

        uint resultIndex = 0;
        for (uint256 i = 1; i <= postCounter; i++) {
            if (
                !posts[i].isDeleted &&
                (_user == address(0) ||
                    posts[i].username == _user ||
                    (onlyFollowed && followers[msg.sender][posts[i].username]))
            ) {
                postDataArray[resultIndex] = posts[i];
                resultIndex++;
            }
        }

        return postDataArray;
    }

    //add the list price
    function listPost(uint256 postId, uint256 _listPrice) external {
        require(
            msg.sender == posts[postId].username,
            "You are not the owner so u can't list"
        );
        require(posts[postId].hasListed == false, "Already listed so u can't");

        posts[postId].hasListed = true;
        posts[postId].listPrice = _listPrice;

        address[] memory followerList = getFollowers(msg.sender);
        for (uint256 i = 0; i < followerList.length; i++) {
            address follower = followerList[i];
            emit ListPostEvent(follower, msg.sender, postId);
        }
    }

    //cancel a listing
    function cancelListing(uint256 postId) external {
        require(
            msg.sender == posts[postId].username,
            "You are not the owner so u can't list"
        );
        require(posts[postId].hasListed == true, "Not listed so u can't");

        posts[postId].hasListed = false;
        posts[postId].listPrice = 0 ether;

        address[] memory followerList = getFollowers(msg.sender);
        for (uint256 i = 0; i < followerList.length; i++) {
            address follower = followerList[i];
            emit CancelPostEvent(follower, msg.sender, postId);
        }
    }

    //buy the post
    function buyPost(uint256 postId) external payable {
        require(posts[postId].hasListed, "This post is not listed for sale.");

        require(
            posts[postId].username != msg.sender,
            "You cannot buy your own post."
        );

        address payable postOwner = posts[postId].username;
        address buyer = msg.sender;

        // Transfer the list price to the original owner
        postOwner.transfer(msg.value);

        // Transfer the NFT to the buyer
        _transfer(postOwner, buyer, postId);

        // Update the post's ownership in the posts mapping
        posts[postId].username = payable(buyer);

        posts[postId].userWhoPaid.push(postOwner);
        // Optionally, reset the listing state if the post should no longer be considered listed after the sale
        posts[postId].hasListed = false;
        posts[postId].listPrice = 0;

        address[] memory followerList = getFollowers(msg.sender);
        for (uint256 i = 0; i < followerList.length; i++) {
            address follower = followerList[i];
            emit ListPostEvent(follower, msg.sender, postId);
        }
    }

    //get ListPrice
    function getListPrice(uint256 postId) public view returns (uint256) {
        return posts[postId].listPrice;
    }

    //get the followers lists
    function getFollowers(address user) public view returns (address[] memory) {
        uint256 followerCount = 0;

        // Count the number of followers for the user
        for (uint256 i = 0; i < arrayList[user].length; i++) {
            address followerAddress = arrayList[user][i];
            if (followers[user][followerAddress]) {
                followerCount++;
            }
        }

        address[] memory followerList = new address[](followerCount);
        uint256 index = 0;

        // Populate the followerList array with the follower addresses
        for (uint256 i = 0; i < arrayList[user].length; i++) {
            address followerAddress = arrayList[user][i];
            if (followers[user][followerAddress]) {
                followerList[index] = followerAddress;
                index++;
            }
        }

        return followerList;
    }

    //for fetching a single post
    function getSinglePost(
        uint256 _id
    ) public view returns (DataTypes.Post memory) {
        require(
            _id > 0 && _id <= postCounter && posts[_id].isDeleted == false,
            "Post Id is wrong or deleted"
        );
        return posts[_id];
    }

    function getOwnerName(uint256 _postId) public view returns (address) {
        return posts[_postId].username;
    }
}
