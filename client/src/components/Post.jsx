import "./Post.css";
import { useState } from "react";
const Post = ({
  displayName,
  text,
  price,
  onClick,
  isCreator,
  postId,
  state,
  hasPaid,
}) => {
  const [isBlurred, setIsBlurred] = useState(!isCreator && !hasPaid);
  const { contract, address } = state;
  const handleViewClick = async () => {
    if (!isCreator) {
      const tx = await contract.viewPaidPost(postId, { value: price });
      const receipt = await tx.wait(); // Wait for the transaction to be mined
      if (receipt.status === 1) {
        console.log("Transaction successful");
        setIsBlurred(false);
      } else {
        console.error("Transaction failed");
      }
    }
  };

  return (
    <div className="post">
      <div className={`post_content ${isBlurred ? "blurred" : ""}`}>
        <div
          className={`viewButton ${
            !isCreator && isBlurred ? "visible" : "hidden"
          }`}
        >
          <i
            className="bi bi-eye-slash"
            style={{ fontSize: "40px", color: "red" }}
            onClick={() => handleViewClick()}
          ></i>
          {/* <IconButton onClick={() => handleViewClick()} aria-label="view">
                            <VisibilityIcon />
                        </IconButton> */}
        </div>

        <div className="post_avatar">
          <img
            src="https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Custom Avatar"
            style={{
              width: "100px",
              height: "100px",
              marginRight: "10px",
              borderRadius: "50%",
            }}
          />
        </div>

        <div className="post_body">
          <div className="post_header">
            <div className="post_headerText">
              <h3>{displayName} </h3>
            </div>
            <div className="post_headerDescription">
              <pre id="contents">{text}</pre>
            </div>

            <p>{price}</p>
          </div>
          <div className="post_footer">
            <i className="bi bi-chat-left"></i>
            <i className="bi bi-heart"></i>
            {isCreator && (
              <i className="bi bi-trash-fill" onClick={onClick}></i>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
