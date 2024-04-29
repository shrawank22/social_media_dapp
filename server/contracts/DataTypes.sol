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
