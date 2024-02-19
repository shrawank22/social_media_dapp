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

    return (
        <div className="post">
            <div className={`viewButton ${!isCreator && isBlurred ? "visible" : "hidden"}`}>
                <i
                    className="bi bi-eye-slash fs-1 text-primary fw-bold"
                    onClick={() => handleViewClick()}
                ></i>
            </div>

            <div className={`post_content ${isBlurred ? "blurred" : ""}`}>
                <div className="d-flex justify-content-between">
                    <div style={{marginRight: "5px"}}>
                        <img src="https://images.unsplash.com/photo-1707159432991-ac67eace0014?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="dp" className="rounded-circle" style={{ width: "50px", height: "50px" }} />
                    </div>
                    <div>
                        <div className="m-2" style={{ fontSize: "15px" }}>
                            <span className="fw-bold">{displayName}</span>
                            <span className="text-secondary"> @shrawank22 ·</span>
                            <span className="text-secondary"> 49m  ·</span>
                            <span className="text-primary fw-bolder text-end"> viewPice: {price}</span>
                        </div>
                

                        <div className="post_description">
                            <p>{text}</p>
                        </div>

                        <div className="media-container">
                            {!isBlurred && decryptedFiles && decryptedFiles.map((src) => (
                                <div key={src} className="media-item">
                                    <img src={src} alt="media" className="img-fluid" />
                                </div>
                            ))}

                            {ipfsHashes && ipfsHashes.map((key) => (
                                <div key={key} className="media-item">
                                    <img src={`https://ipfs.io/ipfs/${key}`} alt="media" className="img-fluid" />
                                </div>
                            ))}
                        </div>

                        <div className="d-flex bg-body-tertiary rounded p-1 justify-content-between">
                            <i className="bi bi-chat-left"></i>
                            <i className="bi bi-heart"></i>
                            <i className="bi bi-flag"></i>
                            {isCreator && (
                                <i className="bi bi-trash-fill" onClick={onClick}></i>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;
