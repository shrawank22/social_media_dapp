// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PostManagement is ERC721 {
    uint256 public postCounter;

    // Mappings
    mapping(uint256 => DataTypes.Post) public posts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(uint256 => mapping(address => bool)) public postDislikes;
    mapping(address => mapping(address => bool)) public followers;
    DataTypes.Gatekeeper[] public gatekeepers;
    mapping(address => bool) public hasAddedGatekeeper;

    // Events
    event AddPost(address indexed recipient, uint256 indexed postId);
    event DeletePost(uint256 indexed postId, bool isDeleted);
    event TipPost(address indexed sender, uint256 indexed postId, uint256 tipAmount);
    event LikePost(address indexed sender, uint256 indexed postId);
    event DislikePost(address indexed sender, uint256 indexed postId);
    event ViewPost(address indexed sender, uint indexed postId);

    constructor() ERC721("PostNFT", "PNFT") {}

    // Functions
    // Add a new post
    function addPost(string memory _postText, uint256 _viewPrice) external payable {
        postCounter++;
        uint256 postId = postCounter;

        DataTypes.Post storage newPost = posts[postId];
        newPost.id = postId;
        newPost.username = payable(msg.sender);
        newPost.postText = _postText;
        newPost.viewPrice = _viewPrice;
        newPost.isDeleted = false;

        _mint(msg.sender, postId); // Mint a new NFT for the post

        emit AddPost(msg.sender, postId);
    }

    // Edit a post
    function editPost(uint256 _postId, string memory _newPostText, uint256 _newPrice) external {
        require(
            posts[_postId].username == msg.sender,
            "You are not the owner of the post"
        );
        require(!posts[_postId].isDeleted, "Post is deleted");

        posts[_postId].postText = _newPostText;
        posts[_postId].viewPrice = _newPrice;
    }

    // Delete a post
    function deletePost(uint postId) external {
        require(posts[postId].username == msg.sender, "You are not the owner of the post");
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
    function getFollowedUsersPosts() external view returns (DataTypes.Post[] memory) {
        return _getPostsByCriteria(msg.sender, true);
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
    function getPostComments(uint256 _postId) external view returns (DataTypes.Comment[] memory) {
        return posts[_postId].comments;
    }

    // View Paid Post
    function viewPaidPost(uint postId) external payable {
        require(!posts[postId].isDeleted, "post is deleted");
        require(posts[postId].username != msg.sender, "You cannot pay to view your own post");

        posts[postId].username.transfer(msg.value); 
        posts[postId].userWhoPaid.push(msg.sender); 
        emit ViewPost(msg.sender, postId);
    }

    function getPaidUsersByPostId(uint256 postId) public view returns(address[] memory)  {
        return posts[postId].userWhoPaid; 
    }

    // Check if a user has paid for a post
    function hasUserPaidForPost(uint256 postId, address user) public view returns (bool) {
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
        followers[msg.sender][_user] = true;
    }

    // Unfollow a user
    function unfollowUser(address _user) external {
        require(_user != msg.sender, "You cannot unfollow yourself");
        followers[msg.sender][_user] = false;
    }

    // Add a gatekeeper
    function addGatekeeper(string memory ip, uint16 port) public {
        require(!hasAddedGatekeeper[msg.sender], "This address has already added a gatekeeper");
        gatekeepers.push(DataTypes.Gatekeeper(ip, port));
        hasAddedGatekeeper[msg.sender] = true;
    }

    // Fetch gatekeepers
    function getGatekeepersCount() public view returns (uint) {
        return gatekeepers.length;
    }
    function getGatekeeper(uint index) public view returns (string memory ip, uint16 port) {
        DataTypes.Gatekeeper memory gatekeeper = gatekeepers[index];
        return (gatekeeper.ip, gatekeeper.port);
    }

    // Helper functions
    function _getPostsByCriteria(address _user, bool onlyFollowed) private view returns (DataTypes.Post[] memory) {
        uint256 counter = 0;
        for (uint256 i = 1; i <= postCounter; i++) {
            if (!posts[i].isDeleted && (_user == address(0) || posts[i].username == _user || (onlyFollowed && followers[msg.sender][posts[i].username]))) {
                counter++;
            }
        }

        DataTypes.Post[] memory postDataArray = new DataTypes.Post[](counter);

        uint resultIndex = 0;
        for (uint256 i = 1; i <= postCounter; i++) {
            if (!posts[i].isDeleted && (_user == address(0) || posts[i].username == _user || (onlyFollowed && followers[msg.sender][posts[i].username]))) {
                postDataArray[resultIndex] = posts[i];
                resultIndex++;
            }
        }

        return postDataArray;
    }
}
