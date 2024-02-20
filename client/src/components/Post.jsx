import "./Post.css";
import { useState, useRef, useEffect } from "react";
import PostHelper from "./PostHelper";

const Post = ({
    displayName,
    text,
    price,
    onClick,
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
    }, []);

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
                    <i className="bi bi-chat-left" data-bs-toggle="modal" data-bs-target="#commentModal"></i>
                    <i className="bi bi-heart"></i>
                    <i className="bi bi-flag"></i>
                    {isCreator && (
                        <i className="bi bi-pencil-square"></i>
                    )}
                    {isCreator && (
                        <i className="bi bi-trash-fill" onClick={onClick}></i>
                    )}
                </div>


                {/* Modal */}
                <div className="modal fade" id="commentModal" tabIndex="-1" aria-labelledby="commentModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="commentModalLabel">Someone's Post</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <PostHelper displayName={displayName} text={text} price={price} decryptedFiles={decryptedFiles} ipfsHashes={ipfsHashes} isBlurred={false} />
                                <div className="d-flex bg-body-tertiary rounded p-1 justify-content-around">
                                    <i className="bi bi-chat-left" data-bs-toggle="modal" data-bs-target="#commentModal"></i>
                                    <i className="bi bi-heart"></i>
                                    <i className="bi bi-flag"></i>
                                    {isCreator && (
                                        <i className="bi bi-pencil-square"></i>
                                    )}
                                    {isCreator && (
                                        <i className="bi bi-trash-fill" onClick={onClick}></i>
                                    )}
                                </div>

                                <div className="comments">
                                    {comments.map((comment) => (
                                        <div key={comment} className="comment">
                                            <h4>{comment[1]}</h4>
                                            <p>{comment[2]}</p>
                                        </div>
                                    ))}
                                </div>
                                <span>
                                    <input className="mx-2 p-1 rounded" ref={commentRef} type="text" placeholder="Write a comment..." />
                                    <button className="btn btn-primary rounded-pill" onClick={handleCommentPost}>Comment</button>
                                </span>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;