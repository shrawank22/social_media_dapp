// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";

contract NotificationsManagement {
    // Mappings related to follow and blocking
    mapping(address => DataTypes.Notification[]) public userNotifications;

    // Functions 
    function addNotification(address _user, DataTypes.NotificationType _type, address _fromUser, uint _postId, string memory _info) private {
        DataTypes.Notification memory newNotification;
        newNotification.notificationType = _type;
        newNotification.fromUser = _fromUser;
        newNotification.associatedPostId = _postId;
        newNotification.additionalInfo = _info;

        userNotifications[_user].push(newNotification);
    }

    function viewNotifications() external view returns (DataTypes.Notification[] memory) {
        return userNotifications[msg.sender];
    }

    function clearNotifications() external {
        delete userNotifications[msg.sender];
    }

}
