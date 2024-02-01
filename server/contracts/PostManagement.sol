// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract PostManagement is ERC721 {
    // // Post Count
    // uint256 public postCounter;
    using Counters for Counters.Counter;
    Counters.Counter public postCounter;

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
        // postCounter++;
        // uint256 postId = postCounter;
        postCounter.increment();
        uint256 postId = postCounter.current();

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

    function getAllPosts() external view returns (DataTypes.Post[] memory) {
        return _getPostsByCriteria(address(0));
    }

    function getMyPosts() external view returns (DataTypes.Post[] memory) {
        return _getPostsByCriteria(msg.sender);
    }

    function deletePost(uint postId) external {
        require(posts[postId].username == msg.sender, "You are not the owner of the post");
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

        // Helping Functions
    function _getPostsByCriteria(address _user) private view  returns (DataTypes.Post[] memory) {
        uint counter = 0;
        for (uint i = 1; i <= postCounter.current(); i++) {
            if ((_user == address(0) || posts[i].username == _user) && !posts[i].isDeleted) {
                counter++;
            }
        }

        DataTypes.Post[] memory postDataArray = new DataTypes.Post[](counter);

        uint resultIndex = 0;
        for (uint i = 1; i <= postCounter.current(); i++) {
            if ((_user == address(0) || posts[i].username == _user) && !posts[i].isDeleted) {
                DataTypes.Post storage post = posts[i];
            
                postDataArray[resultIndex] = DataTypes.Post({
                    id: post.id,
                    username: post.username,
                    postText: post.postText,
                    viewPrice: post.viewPrice,
                    isDeleted: post.isDeleted,
                    likes: post.likes,
                    dislikes: post.dislikes,
                    visibility: post.visibility,
                    comments: post.comments,
                    reports: post.reports
                });
                resultIndex++;
            }
        }
        
        return postDataArray;
    }
}
