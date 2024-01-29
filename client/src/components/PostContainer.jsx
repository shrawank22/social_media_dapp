import { useState } from "react";
import "./PostContainer.css";
import axios from "axios";
import EmojiPicker from 'emoji-picker-react';


function PostContainer({ state }) {
    const { contract, address, signer, provider } = state;

    const [postText, setPostText] = useState('');
    const [viewPrice, setViewPrice] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); 

    const updatePostText = event => {
        setPostText(event.target.value)
    }

    const updateViewPrice = event => {
        const value = event.target.value;
        // Allow only numbers and floating point input
        if (!isNaN(value) && value.match(/^(\d+)?([.]?\d+)?$/)) {
            setViewPrice(value);
        }
    }

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker)
    }

    const addPostHandler = async (event) => {
        event.preventDefault();
        try {
            console.log("Trying to add a post");
            if (postText === '' || viewPrice === '') {
                console.log("Input fields can't be empty")
            } else {
                const content = {
                    text: postText,
                    isPaid: true,
                    viewPrice: parseFloat(viewPrice) * 100
                };

                try {
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", content, {
                        headers: {
                            pinata_api_key: "b895eaa0c01051beab70",
                            pinata_secret_api_key: "41fc26eb82d75c1893429a0cdb79afcb20dcc224d3f26ee7eeaff872c5373ffb"
                        }
                    });
                    console.log(res.data.IpfsHash);
                    const ipfsHash = res.data.IpfsHash;
                    await contract.addPost(String(ipfsHash), true, parseInt(content.viewPrice));
                    // resetting inputs
                    setPostText('');
                    setViewPrice('');


                } catch (error) {
                    console.log(error);
                }
            }
        } catch (err) {
            console.log(err.message)
        }
    }

    return (
        <form onSubmit={(e) => addPostHandler(e)}>
            <div className="row">
                <div className="col-12">
                    <textarea
                        onChange={updatePostText}
                        placeholder="What's happening?"
                        required
                    />
                </div>
            </div>
    
            <div className="row">
                <div className="col-1">
                    <label htmlFor="media" className="form-label"><i className="bi bi-card-image text-primary fs-3"></i> </label>
                    <input accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/quicktime" type="file" className="d-none" id="media" />
                </div>

                <div className="col-1">
                    <i className="bi bi-emoji-smile text-primary fs-3" onClick={toggleEmojiPicker}></i>
                    {showEmojiPicker && <EmojiPicker />}
                </div>

                <div className="col-2">
                    <input
                        onChange={updateViewPrice}
                        type="number"
                        min={0}
                        className="form-control"
                        placeholder="Price"
                        value={viewPrice}
                        required
                    />
                </div>

                <div className="col-8 text-end">
                    <button className="btn btn-primary rounded-pill" type="submit">Post</button>
                </div>
            </div>
        </form>
    );
}

export default PostContainer;