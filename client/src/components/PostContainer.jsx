import { useState } from "react";
import "./PostContainer.css";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import EmojiPicker from 'emoji-picker-react';
import CryptoJS from 'crypto-js'
import { Buffer, combine, constants, split } from 'shamirs-secret-sharing'

function PostContainer({ state }) {
    const { contract, address, signer, provider } = state;

    const [postText, setPostText] = useState('');
    const [viewPrice, setViewPrice] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [fileIpfsHashes, setFileIpfsHashes] = useState([])

    const gatekeepersCount = Number(import.meta.env.VITE_KEEPER_COUNT);

    const updatePostText = (event) => {
        setPostText(event.target.value);
    };

    const updateViewPrice = (event) => {
        const value = event.target.value;
        if (!isNaN(value) && value.match(/^(\d+)?([.]?\d+)?$/)) {  // Allow only numbers and floating-point input
            setViewPrice(value);
        }
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const addEmojiToPostText = (emoji) => {
        setPostText(prevPostText => prevPostText + emoji.emoji);
    };

    const handleFileChange = async (e) => {
        const files = e.target.files;
        setSelectedFiles(files);

        // Create previews for the selected files
        const previews = Array.from(files).map((file) => URL.createObjectURL(file));
        setFilePreviews(previews);

        // Upload each file to IPFS
        const fileHashes = await Promise.all(Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'pinata_api_key': import.meta.env.VITE_PINATA_KEY,
                    'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY,
                },
            });

            return response.data.IpfsHash;
        }));

        setFileIpfsHashes(fileHashes);
    };


    const addPostHandler = async (event) => {
        event.preventDefault();
        try {
            console.log("Trying to add a post");
            if (postText === '' || viewPrice === '') {
                console.log("Input fields can't be empty");
            } else {
                let content = {
                    postText: postText,
                    viewPrice: parseFloat(viewPrice) * 100
                };

                const uniqueId = uuidv4();

                if (content.viewPrice > 0) {
                    // Encrypt the content and split the key
                    let key = CryptoJS.lib.WordArray.random(256 / 8).toString(); // Generate a random encryption key
                    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(content), key).toString(); // Used AES to encrypt the content

                    // Split the key into parts
                    const shares = split(Buffer.from(key), { shares: gatekeepersCount, threshold: Math.ceil(gatekeepersCount * 2 / 3) });

                    const keyShares = shares.map(share => share.toString('hex'))
                    // console.log(keyShares, ciphertext)

                    // Send each share to a different gatekeeper
                    for (let i = 0; i < gatekeepersCount; i++) {
                        await axios.post(`http://localhost:8080/api/gatekeepers/${i}/share/${uniqueId}`, { share: keyShares[i] }, {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        });
                    }

                    // Storing paid content to IPFS
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", { ciphertext, uniqueId, fileIpfsHashes }, {
                        headers: {
                            pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                        },
                    });
                    console.log(res.data.IpfsHash);
                    const ipfsHash = res.data.IpfsHash;
                    
                    // -----------Retrieving content---------
                    // const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);
                    // const data = response.data;
                    // console.log(data);

                    // Store hash onto blockchain
                    await contract.addPost(String(ipfsHash), parseInt(content.viewPrice));

                } else {
                    // Storing free content to IPFS
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", content, {
                        headers: {
                            pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                        },
                    });
                    console.log(res.data.IpfsHash);
                    const ipfsHash = res.data.IpfsHash;

                    // Store hash onto blockchain
                    await contract.addPost(String(ipfsHash), parseInt(content.viewPrice));
                }

                // Resetting inputs
                setPostText('');
                setViewPrice('');
            }
        } catch (err) {
            console.log(err);
        }
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
                <div className="col-12 card">
                    {filePreviews.map((preview, index) => (
                        <img key={index} src={preview} alt={`Preview ${index}`} style={{ width: "100%" }} />
                    ))}

                </div>
            </div>
            <div className="row">
                <div className="col-1">
                    <label htmlFor="media" className="form-label"><i className="bi bi-card-image text-primary fs-3"></i> </label>
                    <input accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/quicktime" type="file" className="d-none" id="media" onChange={handleFileChange} multiple="multiple" />
                </div>

                <div className="col-1">
                    <i className="bi bi-emoji-smile text-primary fs-3" onClick={toggleEmojiPicker}></i>
                    {showEmojiPicker && <EmojiPicker onEmojiClick={(emoji) => addEmojiToPostText(emoji)} />}
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