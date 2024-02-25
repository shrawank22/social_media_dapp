import { useState, useContext } from "react";
import "./PostContainer.css";
import EmojiPicker from 'emoji-picker-react';
import postContext from '../context/post/postContext';

function PostContainer() {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const context = useContext(postContext);
    const { postText, viewPrice, fileURLs, setFileURLs, setPostText, setSelectedFiles, setViewPrice, addPostHandler, isPosting } = context;

    const updatePostText = (event) => {
        setPostText(event.target.value);
    };

    const updateViewPrice = (event) => {
        const value = event.target.value;
        if (!isNaN(value) && value.match(/^(\d+)?([.]?\d+)?$/)) {  
            setViewPrice(value);
        }
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const addEmojiToPostText = (emoji) => {
        setPostText(prevPostText => prevPostText + emoji.emoji);
    };

    const handleFileChange = (event) => {
        const files = event.target.files;
        const filesArray = Array.from(files); // Convert FileList to an array

        // filesArray.forEach(file => {
        //     console.log(`File: ${file.name}, Size: ${file.size} bytes`);
        // });

        const urls = filesArray.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
        setFileURLs(urls);

        setSelectedFiles(filesArray);
    };

    return (
        <form onSubmit={(e) => addPostHandler(e)}>
            <div className="row">
                <div className="col-12">
                    <textarea
                        value={postText}
                        onChange={updatePostText}
                        placeholder="What's happening?"
                        required
                    />
                </div>
            </div>

            <div className="d-flex justify-content-between">
                <div>
                    <i className="bi bi-emoji-smile text-primary fs-4" onClick={toggleEmojiPicker} title="emoji" ></i>
                    {showEmojiPicker && (
                        <div className="emoji-picker-container">
                            <EmojiPicker className="emoji-picker" onEmojiClick={(emoji) => addEmojiToPostText(emoji)} height={400} width={250} />
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="media" className="form-label"><i className="bi bi-card-image text-primary fs-4" title="media"></i> </label>
                    <input accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/quicktime" type="file" className="d-none" id="media" onChange={handleFileChange} multiple />
                    <ul>
                        {fileURLs.map((file, index) => (
                            <li key={index}>
                                <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ flexBasis: "120px" }}>
                    <input
                        onChange={updateViewPrice}
                        type="number"
                        min={0}
                        className="form-control"
                        placeholder="Price"
                        value={viewPrice}
                        required
                    />
                    <div className="form-text">ViewPrice, Enter 0 if free</div>
                </div>

                <div>
                    <button disabled={isPosting} className="btn btn-primary rounded-pill" type="submit">Post</button>
                </div>
            </div>

        </form >
    );
}

export default PostContainer;