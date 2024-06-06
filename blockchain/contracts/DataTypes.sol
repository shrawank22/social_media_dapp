<<<<<<< HEAD:server/contracts/DataTypes.sol
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

library DataTypes {
    enum Visibility { Public, FollowersOnly, Private }

    struct Post {
        uint256 id;
        address payable username;
        string postText;
        uint256 viewPrice;
        bool isDeleted;
        uint256 likes;
        uint256 dislikes;
        Visibility visibility;
        Comment[] comments;
        Report[] reports; 
        address[] userWhoPaid; 
        bool hasListed; //new added
        uint256 listPrice; //new added  
    }

    struct Comment {
        uint256 id;
        address payable commenter;
        string commentText;
    }

    struct Report {
        uint256 id;
        address reporter;
        string reason;
    }

    struct Gatekeeper {
        string ip;
        uint16 port;
    }
}
=======
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

library DataTypes {
    enum Visibility { Public, FollowersOnly, Private }

    struct Post {
        uint256 id;
        address payable username;
        string postText;
        uint256 viewPrice; //index 3 
        bool isDeleted;
        uint256 likes;
        uint256 dislikes;
        Visibility visibility;
        Comment[] comments;
        Report[] reports; 
        address[] userWhoPaid; 
        bool hasListed; //new added
        uint256 listPrice; //new added  
    }

    struct Comment {
        uint256 id;
        address payable commenter;
        string commentText;
    }

    struct Report {
        uint256 id;
        address reporter;
        string reason;
    }

    struct Gatekeeper {
        string ip;
        uint16 port;
    }
}
>>>>>>> 13a6382d59f7b75c5184246dbd9e8bfe21ecafc0:blockchain/contracts/DataTypes.sol
