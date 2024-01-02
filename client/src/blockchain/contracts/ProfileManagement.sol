// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./DataTypes.sol";

contract ProfileManagement {
    // Mappings related to follow and blocking
    mapping(address => DataTypes.Profile) public userProfiles;

    // Functions 
   function setProfile(string memory _name, string memory _bio, string memory _imageLink) external {
        DataTypes.Profile memory userProfile;
        userProfile.name = _name;
        userProfile.bio = _bio;
        userProfile.profileImageLink = _imageLink;

        userProfiles[msg.sender] = userProfile;
    }

    function viewProfile(address _user) external view returns (DataTypes.Profile memory) {
        return userProfiles[_user];
    }

}
