import "./Post.css";
import { useState, useRef, useEffect, useContext } from "react";
import PostHelper from "./PostHelper";
import postContext from '../context/post/postContext';
import axios from "axios";
import { Buffer, combine } from 'shamirs-secret-sharing'
import CryptoJS from 'crypto-js'

const Post = ({
    displayName,
    text,
    price,
    deletePostHandler,
    isCreator,
    postId,
    state,
    hasPaid,
    decryptedFiles,
    ipfsHashes
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

    const commentRef = useRef(null);
    const [comments, setComments] = useState([]);

    const context = useContext(postContext);
    const { showAlert, getPost } = context;

    const [editedText, setEditedText] = useState(text);
    const [editedPrice, setEditedPrice] = useState(price);

    const handleCommentPost = async () => {
        const comment = commentRef.current.value;
        if (!comment) {
            return;
        }
        try {
            const tx = await contract.addComment(postId, comment);
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                console.log("Comment posted successfully");
            } else {
                console.error("Comment posting failed");
            }
        }
        catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    const updatePostHandler = async (event) => {
        event.preventDefault();
        try {
            let content = {
                postText: editedText,
                viewPrice: parseFloat(editedPrice) * 100
            };

            // Getting meta data of post which is saved in DB
            const data = await getPost(postId);
            const { uniqueID, ipfsHashes, encryptedFiles } = data[0];

            if (editedPrice > 0) {
                // Retrieving key from gatekeepers
                const retrievedShares = [];
                const gatekeepersCount = Number(import.meta.env.VITE_KEEPER_COUNT);
                for (let i = 0; i < gatekeepersCount; i++) {
                    const response = await axios.get(`http://localhost:8080/api/gatekeepers/${i}/share/${uniqueID}`);
                    retrievedShares.push(Buffer.from(response.data.share, 'hex'));

                    if (retrievedShares.length === Math.ceil(2 * gatekeepersCount / 3)) break;
                }

                let retrievedKey = combine(retrievedShares).toString();
                const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(content), retrievedKey).toString(); // Used AES to encrypt the content
                
                // Storing paid content to IPFS
                const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", { ciphertext, uniqueId: uniqueID, encryptedFiles }, {
                    headers: {
                        pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                    },
                });
                const ipfsHash = res.data.IpfsHash;

                // Store hash onto blockchain
                const tx = await contract.editPost(postId, String(ipfsHash), parseInt(content.viewPrice));
                await tx.wait();
            } else {
                content.ipfsHashes = ipfsHashes;
                // console.log(content);

                // Storing free content to IPFS
                const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                    pinataContent: content,
                    pinataMetadata: {
                        name: uniqueID
                    }
                }, {
                    headers: {
                        pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                    },
                });
                const ipfsHash = res.data.IpfsHash;

                // Store hash onto blockchain
                const tx = await contract.editPost(postId, String(ipfsHash), parseInt(content.viewPrice));
                await tx.wait();
            }
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error updating post");
            return null;
        }
    }

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const comments = await contract.getPostComments(postId);
                setComments(comments);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        fetchComments();
    }, [comments]);

    return (
        <div className="post">
            <div className={`viewButton ${!isCreator && isBlurred ? "visible" : "hidden"}`}>
                <i
                    className="bi bi-eye-slash fs-1 text-primary fw-bold"
                    onClick={() => handleViewClick()}
                ></i>
            </div>

            <div className={`post_content ${isBlurred ? "blurred" : ""}`}>
                <PostHelper displayName={displayName} text={text} price={price} decryptedFiles={decryptedFiles} ipfsHashes={ipfsHashes} isBlurred={isBlurred} />
                <div className="d-flex bg-body-tertiary rounded p-1 justify-content-around">
                    <i className="bi bi-chat-left" data-bs-toggle="modal" data-bs-target={`#commentModal-${postId}`}></i>
                    <i className="bi bi-heart"></i>
                    <i className="bi bi-flag"></i>
                    {isCreator && (
                        <i className="bi bi-pencil-square" data-bs-toggle="modal" data-bs-target={`#editModal-${postId}`}></i>
                    )}
                    {isCreator && (
                        <i className="bi bi-trash-fill" onClick={deletePostHandler}></i>
                    )}
                </div>

                {/* Modal for editing */}
                <div className="modal fade" id={`editModal-${postId}`} tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="editModalLabel">Edit Post</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={updatePostHandler}>
                                    <div className="mb-3">
                                        <label htmlFor="editedText" className="form-label">Text</label>
                                        <textarea
                                            id="editedText"
                                            className="form-control"
                                            value={editedText}
                                            onChange={(e) => setEditedText(e.target.value)}
                                            placeholder="What's happening?"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="editedPrice" className="form-label">View Price</label>
                                        <input type="number" min={0} className="form-control" id="editedPrice" value={editedPrice} onChange={(e) => setEditedPrice(e.target.value)} />
                                    </div>
                                    <button type="submit" className="btn btn-success rounded-pill">Update Post</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal for view and commenting*/}
                <div className="modal fade" id={`commentModal-${postId}`} tabIndex="-1" aria-labelledby="commentModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="commentModalLabel">Someone's Post</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <PostHelper displayName={displayName} text={text} price={price} decryptedFiles={decryptedFiles} ipfsHashes={ipfsHashes} isBlurred={false} />
                                <div className="d-flex bg-body-tertiary rounded p-1 justify-content-around">
                                    <i className="bi bi-chat-left" data-bs-toggle="modal" data-bs-target={`#commentModal-${postId}`}></i>
                                    <i className="bi bi-heart"></i>
                                    <i className="bi bi-flag"></i>
                                    {isCreator && (
                                        <i className="bi bi-pencil-square"></i>
                                    )}
                                    {isCreator && (
                                        <i className="bi bi-trash-fill" onClick={deletePostHandler}></i>
                                    )}
                                </div>
                                <hr />
                                <span className="d-flex">
                                    <input className="form-control" ref={commentRef} type="text" placeholder="Write a comment..." />
                                    <button className="btn btn-success rounded-pill" onClick={handleCommentPost}>Comment</button>
                                </span>


                                {comments.map((comment) => (
                                    <div key={comment} className="p-1 bg-body-tertiary rounded-2">
                                        <div className="d-flex justify-content-start">
                                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Profile" style={{
                                                height: '50px',
                                                width: '50px',
                                                borderRadius: '50%',
                                                marginRight: '10px'
                                            }} />
                                            <h6 className="mt-3 text-primary">{comment[1]}</h6>
                                        </div>
                                        <p className="ms-5">{comment[2]}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;