// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";
import "./PostBase.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PostManagement is PostBase{
    // Counters
    using Counters for Counters.Counter;
    
    // Mappings related to posts
    // mapping(uint256 => DataTypes.Post) public posts;
    mapping(uint256 => DataTypes.Report) public reports;
    mapping(uint256 => DataTypes.Report[]) public postToReports;
    
    // Events
    event AddPost(address indexed recipient, uint indexed postId, bool indexed isPaid);
    event DeletePost(uint indexed postId, bool isDeleted);
    event TipPost(address indexed sender, uint indexed postId, uint tipAmount);

    // Functions
    function addPost(string memory _postText, bool _isPaid, uint _viewPrice) external payable {
        postCounter.increment();
        uint256 postId = postCounter.current();

        DataTypes.Post storage newPost = posts[postId];
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

    function viewPaidPost(uint postId) external payable {
        require(posts[postId].isPaid, "Post is not paid");
        uint viewPrice = posts[postId].viewPrice;

        payable(posts[postId].username).transfer(viewPrice);

        emit TipPost(msg.sender, postId, msg.value);
    }

    function getpostDetails(uint256 postId) external view returns (uint256, address, string memory, bool, uint256, bool) {
        DataTypes.Post storage post = posts[postId];
        return (
            post.id,
            post.username,
            post.postText,
            post.isPaid,
            post.viewPrice,
            post.isDeleted
        );
    }

    function getAllposts() external view returns (DataTypes.PostData[] memory) {
        return _getPostsByCriteria(address(0), "");
    }


    function getMyposts() external view returns (DataTypes.PostData[] memory) {
        return _getPostsByCriteria(msg.sender, "");
    }

    function searchPostsByUser(address _user) external view returns (DataTypes.PostData[] memory) {
        return _getPostsByCriteria(_user, "");
    }


    function searchPostsByTag(string memory _tag) external view returns (DataTypes.PostData[] memory) {
        return _getPostsByCriteria(address(0), _tag);
    }

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
        function _getPostsByCriteria(address _user, string memory _tag) private view  returns (DataTypes.PostData[] memory) {
        bytes32 emptyTagHash = keccak256(abi.encodePacked(""));
        bytes32 tagHash = keccak256(abi.encodePacked(_tag));
        uint counter = 0;
        for (uint i = 1; i <= postCounter.current(); i++) {
            if ((_user == address(0) || posts[i].username == _user) && (tagHash == emptyTagHash || _containsTag(posts[i].tags, _tag)) && !posts[i].isDeleted) {
                counter++;
            }
        }

        DataTypes.PostData[] memory postDataArray = new DataTypes.PostData[](counter);

        uint resultIndex = 0;
        for (uint i = 1; i <= postCounter.current(); i++) {
            if ((_user == address(0) || posts[i].username == _user) && (tagHash == emptyTagHash || _containsTag(posts[i].tags, _tag)) && !posts[i].isDeleted) {
                DataTypes.Post storage post = posts[i];
            
                postDataArray[resultIndex] = DataTypes.PostData({
                    id: post.id,
                    username: post.username,
                    postText: post.postText,
                    isPaid: post.isPaid,
                    viewPrice: post.viewPrice,
                    isDeleted: post.isDeleted,
                    likes: post.likes,
                    dislikes: post.dislikes,
                    visibility: post.visibility,
                    tags: post.tags
                });
                resultIndex++;
            }
        }
        
        return postDataArray;
    }

    function _containsTag(string[] memory tags, string memory _tag) private pure returns (bool) {
        for (uint i = 0; i < tags.length; i++) {
            if (keccak256(abi.encodePacked(tags[i])) == keccak256(abi.encodePacked(_tag))) {
                return true;
            }
        }
        return false;
    }
}