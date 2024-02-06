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
                <div className={`viewButton ${!isCreator && isBlurred ? "visible" : "hidden"}`}>
                    <i
                        className="bi bi-eye-slash"
                        style={{ fontSize: "40px", color: "red" }}
                        onClick={() => handleViewClick()}
                    ></i>
                </div>


                <div className="row">
                    <div className="col-1">
                        <img src="https://images.unsplash.com/photo-1707159432991-ac67eace0014?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Profile Picture" className="rounded-circle" style={{ width: "40px", height: "40px" }} />
                    </div>
                    <div className="col-11">
                        <div className="mb-2" style={{ fontSize: "15px" }}>
                            <span className="fw-bold">{displayName} </span>
                            <span className="text-secondary">@shrawank22 · </span>
                            <span className="text-secondary">49m</span>
                        </div>

                        <div className="post_description">
                            <p>{text}</p>
                        </div>

                        <div className="media-container">
                            <div className="media-item">
                                <img src="https://images.unsplash.com/photo-1707159432991-ac67eace0014?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Media 1" className="img-fluid" />
                            </div>
                            <div className="media-item">
                                <img src="https://images.unsplash.com/photo-1707159432991-ac67eace0014?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Media 2" className="img-fluid" />
                            </div>
                            <div className="media-item">
                                <img src="https://images.unsplash.com/photo-1707159432991-ac67eace0014?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Media 3" className="img-fluid" />
                            </div>
                            <div className="media-item">
                                <img src="example-image4.jpg" alt="Media 4" className="img-fluid" />
                            </div>
                        </div>
                    </div>

                </div>



                {/* <div className="post_body">
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
                </div> */}
            </div>
        </div>
    );
};

export default Post;
