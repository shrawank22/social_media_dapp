import "./SidebarOption.css";

function SidebarOption({ text, Icon, onPress }) {

    const handleClick = () => {
        onPress(text);
    };


    return (
        <div className="sidebarOption" onClick={handleClick}>
            <Icon />
            <h2>{text}</h2>
        </div>
    );
}

export default SidebarOption;