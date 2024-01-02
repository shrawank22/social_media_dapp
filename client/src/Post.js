import React, { forwardRef } from "react";
import "./Post.css";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import DeleteIcon from '@material-ui/icons/Delete';

const Post = forwardRef(
  ({ displayName, text, price, onClick, isCreator }, ref) => {

    return (
      <div className="post" ref={ref}>

        <div className="post_avatar">
          <img
            src="https://qph.cf2.quoracdn.net/main-thumb-401012302-200-qjrtpkfzscqeqnoirkesayialmrsiejk.jpeg"
            alt="Custom Avatar"
            style={{ width: '100px', height: '100px', marginRight: '10px', borderRadius: '50%' }}
          /> 
        </div>

        <div className="post_body">
          <div className="post_header">
            <div className="post_headerText">
              <h3>
                {displayName}{" "}
              </h3>
            </div>
            <div className="post_headerDescription">
              <pre id="contents">{text}</pre>
            </div>

            <div className="sadjsa">
              <p>{price}</p>
            </div>
          </div>
          <div className="post_footer">
            <ChatBubbleOutlineIcon fontSize="small" />
            <FavoriteBorderIcon fontSize="small" />
            {isCreator && (
              <DeleteIcon fontSize="small" onClick={onClick}/>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default Post;