// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";

contract FollowManagement {
    // Mappings related to follow and blocking
    mapping(address => address[]) public followers;
    mapping(address => address[]) public following;
    mapping(address => mapping(address => bool)) public blockedBy;

    // Functions 
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

}
