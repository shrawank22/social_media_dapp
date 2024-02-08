import { useState } from "react";
import "./PostContainer.css";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import EmojiPicker from 'emoji-picker-react';
import CryptoJS from 'crypto-js'
import { Buffer, split } from 'shamirs-secret-sharing'

function PostContainer({ state }) {
    const { contract, address, signer, provider } = state;

    const [postText, setPostText] = useState('');
    const [viewPrice, setViewPrice] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isPosting, setIsPosting] = useState(false);

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

    const handleFileChange = (event) => {
        const files = event.target.files;
        const filesArray = Array.from(files); // Convert FileList to an array

        // filesArray.forEach(file => {
        //     console.log(`File: ${file.name}, Size: ${file.size} bytes`);
        // });

        setSelectedFiles(filesArray);
    };

    const handleFileEncrypt = (key) => {
        const encryptedFilesArray = [];

        selectedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const fileContent = event.target.result;
                const base64Content = btoa(fileContent);
                const encryptedContent = CryptoJS.AES.encrypt(base64Content, key).toString();
                encryptedFilesArray.push(encryptedContent);
            };
            reader.readAsBinaryString(file);
        });
        return encryptedFilesArray
    };

    const addPostHandler = async (event) => {
        event.preventDefault();
        setIsPosting(true);
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

                    // Encrypt all the selected files
                    let encryptedFiles = [];
                    if (selectedFiles) {
                        encryptedFiles = handleFileEncrypt(key);
                    }

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
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", { ciphertext, uniqueId, encryptedFiles }, {
                        headers: {
                            pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                        },
                    });
                    console.log(res.data.IpfsHash);
                    const ipfsHash = res.data.IpfsHash;

                    // -----------Retrieving content---------
                    // const response = await axios.get(`https://brown-bright-emu-470.mypinata.cloud/ipfs/${ipfsHash}`);
                    // const data = response.data;
                    // console.log(data);

                    // Store hash onto blockchain
                    const receipt = await contract.addPost(String(ipfsHash), parseInt(content.viewPrice));
                    await receipt.wait();
                } else {
                    const ipfsHashes = [];
                    for (const file of selectedFiles) {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('pinataMetadata', JSON.stringify({ name: file.name }));

                        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                            maxBodyLength: 'Infinity',
                            headers: {
                                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                                pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                                pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                            },
                        });
                        // console.log(res.data.IpfsHash);
                        const ipfsHash = res.data.IpfsHash;
                        ipfsHashes.push(ipfsHash);
                    }

                    content.ipfsHashes = ipfsHashes;


                    // Storing free content to IPFS
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                        pinataContent: content,
                        pinataMetadata: {
                            name: uniqueId
                        }
                    }, {
                        headers: {
                            pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                        },
                    });
                    console.log(res.data.IpfsHash);
                    const ipfsHash = res.data.IpfsHash;

                    // Store hash onto blockchain
                    const receipt = await contract.addPost(String(ipfsHash), parseInt(content.viewPrice));
                    await receipt.wait();
                }

                // Resetting inputs
                setPostText('');
                setViewPrice('');
                // getAllPosts();
                setIsPosting(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <form onSubmit={(e) => addPostHandler(e)}>
            <div className="row">
                <div className="col-10">
                    <textarea
                        value={postText}
                        onChange={updatePostText}
                        placeholder="What's happening?"
                        required
                    />
                    <div className="col-12 text-end">
                        <button disabled={isPosting} className="btn btn-primary rounded-pill" type="submit">Post</button>
                    </div>
                </div>

                <div className="col-2">
                    <div className="row">
                        <div className="col-12">
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

                        <div className="col-12">
                            <p className="text-secondary mb-0">ViewPrice , Enter 0 if free</p>
                        </div>

                        <div className="col-6">
                            <i className="bi bi-emoji-smile text-primary fs-4" onClick={toggleEmojiPicker} title="emoji" ></i>
                            {showEmojiPicker && (
                                <div className="emoji-picker-container">
                                    <EmojiPicker className="emoji-picker" onEmojiClick={(emoji) => addEmojiToPostText(emoji)} height={400} width={250} />
                                </div>
                            )}
                        </div>

                        <div className="col-6">
                            <label htmlFor="media" className="form-label"><i className="bi bi-card-image text-primary fs-4" title="media"></i> </label>
                            <input accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/quicktime" type="file" className="d-none" id="media" onChange={handleFileChange} multiple />
                            {selectedFiles.length > 0 && <p className="text-secondary" style={{fontSize: "10px", fontWeight: "bold"}}>{selectedFiles.length} selected</p>}
                        </div>

                    </div>

                </div>
            </div>

            {/* {decryptedFiles.length > 0 && (
                <div>
                    <p>Decrypted Content:</p>
                    {selectedFiles.map((file, index) => (
                        <div key={index}>
                            <p>{file.name}</p>
                            {file.type.startsWith('image/') ? (
                                <img src={decryptedFiles[index]} alt={`Decrypted ${file.name}`} />
                            ) : (
                                <a href={decryptedFiles[index]} download={`decrypted_${file.name}`}>
                                    Download Decrypted {file.name}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}  */}

        </form>
    );
}

export default PostContainer;