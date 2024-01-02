import "./Sidebar.css";
import AppIcon from "@material-ui/icons/BrightnessMediumTwoTone";
import SidebarOption from "./SidebarOption";
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import ListAltIcon from "@material-ui/icons/ListAlt";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { Button } from "@material-ui/core";

function Sidebar({ onOptionClick }) {
  const handleOptionClick = (option) => {
    onOptionClick(option);
  };
  
  return (
    <div className="sidebar">
      <AppIcon className="sidebar-appIcon" />

      <div>
        <SidebarOption Icon={HomeIcon} text="Home" onPress={() => handleOptionClick("Home")} />
        <SidebarOption Icon={SearchIcon} text="Explore" onPress={() => handleOptionClick("Explore")} />
        {/* <SidebarOption Icon={NotificationsNoneIcon} text="Notifications" onPress={() => handleOptionClick("Notifications")} />
        <SidebarOption Icon={MailOutlineIcon} text="Messages" onPress={() => handleOptionClick("Messages")} />
        <SidebarOption Icon={BookmarkBorderIcon} text="Bookmarks" onPress={() => handleOptionClick("Bookmarks")} />
        <SidebarOption Icon={ListAltIcon} text="Lists" onPress={() => handleOptionClick("Lists")} /> */}
        <SidebarOption Icon={PermIdentityIcon} text="Profile" onPress={() => handleOptionClick("Profile")} />
        <SidebarOption Icon={MoreHorizIcon} text="More" onPress={() => handleOptionClick("More")} />
      </div>

      <Button variant="outlined" className="postBtn" fullWidth>
        Post
      </Button>
    </div>
  );
}

export default Sidebar;
