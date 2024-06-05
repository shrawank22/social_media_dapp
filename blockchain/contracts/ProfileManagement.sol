// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract ProfileManagement {
    struct Profile {
        string name;
        string bio;
        string profileImageLink;
    }
    
    mapping(address => Profile) public userProfiles;

    // Functions 
   function setProfile(string memory _name, string memory _bio, string memory _imageLink) external {
        Profile memory userProfile;
        userProfile.name = _name;
        userProfile.bio = _bio;
        userProfile.profileImageLink = _imageLink;

        userProfiles[msg.sender] = userProfile;
    }

    function viewProfile(address _user) external view returns (Profile memory) {
        return userProfiles[_user];
    }

}
