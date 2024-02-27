// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./DataTypes.sol";
import "./PostManagement.sol";
import "./NotificationsManagement.sol";
import "./ProfileManagement.sol";


contract SocialMedia is PostManagement, NotificationsManagement {
    constructor() {
        // Initialization code if needed
    }
}