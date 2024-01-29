// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

library DataTypes {
    enum Visibility { Public, FollowersOnly, Private }
    enum NotificationType { NewFollower, NewComment, PostLiked, PostReported }

    struct Notification {
        NotificationType notificationType;
        address fromUser;
        uint associatedPostId;
        string additionalInfo;
    }

    struct Profile {
        string name;
        string bio;
        string profileImageLink;
    }

    struct Post {
        uint id;
        address payable username;
        string postText;
        bool isPaid;
        uint viewPrice;
        bool isDeleted;
        uint likes;
        uint dislikes;
        Visibility visibility;
    }

    struct Comment {
        uint id;
        address payable commenter;
        uint postId;
        string commentText;
    }

    struct Report {
        uint id;
        address reporter;
        uint postId;
        string reason;
    }

}
