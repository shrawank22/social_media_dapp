// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";
import "./PostBase.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PostManagement is PostBase{
    // Counters
    using Counters for Counters.Counter;
    
    mapping(uint256 => DataTypes.Report) public reports;
    mapping(uint256 => DataTypes.Report[]) public postToReports;
    
    // Events
    event AddPost(address indexed recipient, uint indexed postId);
    event DeletePost(uint indexed postId, bool isDeleted);
    event TipPost(address indexed sender, uint indexed postId, uint tipAmount);

    // Functions
    function addPost(string memory _postText, uint _viewPrice) external payable {
        postCounter.increment();
        uint256 postId = postCounter.current();

        DataTypes.Post storage newPost = posts[postId];
        newPost.id = postId;
        newPost.username = payable(msg.sender);
        newPost.postText = _postText;
        newPost.viewPrice = _viewPrice;
        newPost.isDeleted = false;
        emit AddPost(msg.sender, postId);
    }

    function editPost(uint _postId, string memory _newPostText) external {
        require(posts[_postId].username == msg.sender, "You are not the owner of the post");
        require(!posts[_postId].isDeleted, "Post is deleted");

        posts[_postId].postText = _newPostText;
    }

    function viewPaidPost(uint postId) external payable {
        uint viewPrice = posts[postId].viewPrice;

        payable(posts[postId].username).transfer(viewPrice);

        emit TipPost(msg.sender, postId, msg.value);
    }

    function getpostDetails(uint256 postId) external view returns (uint256, address, string memory, uint256, bool) {
        DataTypes.Post storage post = posts[postId];
        return (
            post.id,
            post.username,
            post.postText,
            post.viewPrice,
            post.isDeleted
        );
    }

    function getAllposts() external view returns (DataTypes.Post[] memory) {
        return _getPostsByCriteria(address(0));
    }

    // function getMyposts() external view returns (DataTypes.Post[] memory) {
    //     return _getPostsByCriteria(msg.sender);
    // }

    function deletePost(uint postId) external {
        require(posts[postId].username == msg.sender, "You are not the owner of the post");
        posts[postId].isDeleted = true;
        emit DeletePost(postId, true);
    }

    // function tipPost(uint postId, uint tipAmnt) external payable {
    //     require(!posts[postId].isDeleted, "post is deleted");
    //     require(tipAmnt > 0, "Invalid tip amount");
    //     require(posts[postId].username != msg.sender, "You cannot tip your own post");

    //     posts[postId].username.transfer(tipAmnt);
    //     emit TipPost(msg.sender, postId, tipAmnt);
    // }

    function reportPost(uint _postId, string memory _reason) external {
        require(!posts[_postId].isDeleted, "Post is deleted");

        reportCounter.increment();
        uint256 reportId = reportCounter.current();

        DataTypes.Report memory newReport;
        newReport.id = reportId;
        newReport.reporter = msg.sender;
        newReport.postId = _postId;
        newReport.reason = _reason;

        reports[reportId] = newReport;
        postToReports[_postId].push(newReport);
    }

    function viewReports(uint _postId) external view returns (DataTypes.Report[] memory) {
        return postToReports[_postId];
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
                    visibility: post.visibility
                });
                resultIndex++;
            }
        }
        
        return postDataArray;
    }
}