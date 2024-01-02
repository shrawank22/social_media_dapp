// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./DataTypes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PostBase.sol";

contract CommentManagement is PostBase {    
    using Counters for Counters.Counter;

    // Mappings related to comments
    mapping(uint256 => DataTypes.Comment) public comments;
    mapping(uint256 => DataTypes.Comment[]) public postToComments;
    
    // Comment related functions
   function addComment(uint _postId, string memory _commentText) external {
        require(!posts[_postId].isDeleted, "Post is deleted");

        commentCounter.increment();
        uint256 commentId = commentCounter.current();

        DataTypes.Comment memory newComment;
        newComment.id = commentId;
        newComment.commenter = payable(msg.sender);
        newComment.postId = _postId;
        newComment.commentText = _commentText;

        comments[commentId] = newComment;
        postToComments[_postId].push(newComment);
    }

    function viewComments(uint _postId) external view returns (DataTypes.Comment[] memory) {
        return postToComments[_postId];
    }
}

