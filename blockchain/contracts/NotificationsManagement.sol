// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract NotificationsManagement {
    enum NotificationType { NewFollower, NewComment, PostLiked, PostReported }

    struct Notification {
        NotificationType notificationType;
        address fromUser;
        uint256 associatedPostId;
        string additionalInfo;
    }
    
    mapping(address => Notification[]) public userNotifications;

    // Functions 
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

}
