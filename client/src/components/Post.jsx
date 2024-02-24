import "./Post.css";
import { useState, useRef, useEffect, useContext } from "react";
import PostHelper from "./PostHelper";
import postContext from '../context/post/postContext';

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

    const updatePostHandler = async (key, post) => {
        try {
            // Getting Unique ID from the post which is saved in DB
            const data = await getPost(key);
            // const {uniqueID} = data[0];

            // Smart Contract Call to update the post
            // console.log(contract.interface.fragments);
            const receipt = await contract.editPost(key, "sygudfhdsfghds", 100);
            await receipt.wait();
            
            // getAllPosts();
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
                        <i className="bi bi-pencil-square" onClick={() => updatePostHandler(postId, "dsjhfuid")}></i>
                    )}
                    {isCreator && (
                        <i className="bi bi-trash-fill" onClick={deletePostHandler}></i>
                    )}
                </div>


                {/* Modal */}
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