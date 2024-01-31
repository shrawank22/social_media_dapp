// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PostManagement is ERC721 {
    // Post Count
    uint256 public postCounter;

    // Mappings
    mapping(uint256 => DataTypes.Post) public posts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(uint256 => mapping(address => bool)) public postDislikes;

    // Events
    event AddPost(address indexed recipient, uint256 indexed postId);
    event DeletePost(uint256 indexed postId, bool isDeleted);
    event TipPost(address indexed sender, uint256 indexed postId, uint256 tipAmount);
    event LikePost(address indexed sender, uint256 indexed postId);
    event DislikePost(address indexed sender, uint256 indexed postId);

    constructor() ERC721("PostNFT", "PNFT") {}

    // Functions
    function addPost(string memory _postText, uint256 _viewPrice)
        external
        payable
    {
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

    function editPost(uint256 _postId, string memory _newPostText) external {
        require(
            posts[_postId].username == msg.sender,
            "You are not the owner of the post"
        );
        require(!posts[_postId].isDeleted, "Post is deleted");

        posts[_postId].postText = _newPostText;
    }

    function addComment(uint256 _postId, string memory _commentText) external {
        require(!posts[_postId].isDeleted, "Post is deleted");

        DataTypes.Comment memory newComment;
        newComment.id = posts[_postId].comments.length + 1;
        newComment.commenter = payable(msg.sender);
        newComment.commentText = _commentText;

        posts[_postId].comments.push(newComment);
    }

    function getPostComments(uint256 _postId)
        external
        view
        returns (DataTypes.Comment[] memory)
    {
        return posts[_postId].comments;
    }

    function viewPaidPost(uint256 postId) external payable {
        uint256 viewPrice = posts[postId].viewPrice;

        payable(posts[postId].username).transfer(viewPrice);

        emit TipPost(msg.sender, postId, msg.value);
    }

    function getpostDetails(uint256 postId)
        external
        view
        returns (
            uint256,
            address,
            string memory,
            uint256,
            bool,
            DataTypes.Comment[] memory,
            DataTypes.Report[] memory
        )
    {
        DataTypes.Post storage post = posts[postId];
        return (
            post.id,
            post.username,
            post.postText,
            post.viewPrice,
            post.isDeleted,
            post.comments,
            post.reports
        );
    }

    function getMyPosts() external view returns (DataTypes.Post[] memory) {
        address owner = msg.sender;
        DataTypes.Post[] memory myPosts = new DataTypes.Post[](postCounter);

        uint256 myPostCount = 0;
        for (uint256 i = 1; i <= postCounter; i++) {
            if (_isPostOwner(i, owner)) {
                myPosts[myPostCount] = posts[i];
                myPostCount++;
            }
        }

        // Resize the array to remove unused slots
        assembly {
            mstore(myPosts, myPostCount)
        }

        return myPosts;
    }

    function getAllPosts() external view returns (DataTypes.Post[] memory) {
        DataTypes.Post[] memory allPosts = new DataTypes.Post[](postCounter);

        for (uint256 i = 1; i <= postCounter; i++) {
            allPosts[i - 1] = posts[i];
        }

        return allPosts;
    }

    function _isPostOwner(uint256 postId, address owner) // Helper function to check if the caller is the owner of the post
        internal
        view
        returns (bool)
    {
        return posts[postId].username == owner && !posts[postId].isDeleted;
    }

    function deletePost(uint256 postId) external {
        require(
            posts[postId].username == msg.sender,
            "You are not the owner of the post"
        );
        posts[postId].isDeleted = true;
        emit DeletePost(postId, true);
    }

    function tipPost(uint256 postId, uint256 tipAmnt) external payable {
        require(!posts[postId].isDeleted, "post is deleted");
        require(tipAmnt > 0, "Invalid tip amount");
        require(
            posts[postId].username != msg.sender,
            "You cannot tip your own post"
        );

        posts[postId].username.transfer(tipAmnt);
        emit TipPost(msg.sender, postId, tipAmnt);
    }

    function likePost(uint256 postId) external {
        require(!posts[postId].isDeleted, "Post is deleted");
        require(!postLikes[postId][msg.sender], "Already liked");

        posts[postId].likes++;
        postLikes[postId][msg.sender] = true;

        emit LikePost(msg.sender, postId);
    }

    function dislikePost(uint256 postId) external {
        require(!posts[postId].isDeleted, "Post is deleted");
        require(!postDislikes[postId][msg.sender], "Already disliked");

        posts[postId].dislikes++;
        postDislikes[postId][msg.sender] = true;

        emit DislikePost(msg.sender, postId);
    }

    function reportPost(uint256 _postId, string memory _reason) external {
        require(!posts[_postId].isDeleted, "Post is deleted");

        DataTypes.Report memory newReport;
        newReport.id = posts[_postId].reports.length + 1;
        newReport.reporter = msg.sender;
        newReport.reason = _reason;

        posts[_postId].reports.push(newReport);
    }


    function viewReports(uint256 _postId)
        external
        view
        returns (DataTypes.Report[] memory)
    {
        return posts[_postId].reports;
    }
}
