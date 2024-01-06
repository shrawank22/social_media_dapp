import "./Sidebar.css";
import AppIcon from "@material-ui/icons/BrightnessMediumTwoTone";
import SidebarOption from "./SidebarOption";
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";
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