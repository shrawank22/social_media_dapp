import "./Post.css";
import { useState, useRef, useEffect, useContext } from "react";
import PostHelper from "./PostHelper";
import postContext from "../context/post/postContext";
import axios from "axios";
import { Buffer, combine } from "shamirs-secret-sharing";
import CryptoJS from "crypto-js";

const Post = ({
  displayName,
  text,
  price,
  deletePostHandler,
  isCreator,
  postId,
  state,
  hasPaid,
  hasListed,
  decryptedFiles,
  ipfsHashes,
}) => {
  const host = "http://localhost:8080";
  const context1 = useContext(postContext);
  const { setFollowEvent } = context1;
  
  const [isBlurred, setIsBlurred] = useState(!isCreator && !hasPaid);
  const [listPrice, setListPrice] = useState(0); // Initialize listPrice state
  const { contract, address } = state;

  const commentRef = useRef(null);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(false);

  const context = useContext(postContext);
  const { showAlert, getPost } = context;

  const [editedText, setEditedText] = useState(text);
  const [editedPrice, setEditedPrice] = useState(price);

  const [likes, setLikes] = useState(0);
  const isLiked = localStorage.getItem(`liked-${address}-${postId}`) === "true";

  const handleListClick = async (price) => {
    console.log("Listing post with price:", price);
    try {
      const tx = await contract.methods.listPost(postId, price).send({ from: address });
      // const receipt = await tx.wait(); // Wait for the transaction to be mined
      if (tx.status === 1) {
        console.log("Transaction successful");
        setIsBlurred(false);
        
        const postData = await contract.methods.getSinglePost(postId).call();
        try {
          const res = await axios.post(
            `${host}/api/postsFollowing`,
            {
              followerUsername: postData[1],
              NFTID: postData[0].toString(),
              username: postData[1],
              postText: postData[2],
              viewPrice: postData[3].toString(),
              isDeleted: postData[4],
              userWhoPaid: postData[10],
              hasListed: postData[11],
              listPrice: postData[12].toString(),
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.log(error);
          showAlert("danger", "Error add PostData");
          return error;
        }

        // Get the NewPostForFollower event from the transaction receipt
        // const followEvent = receipt.logs.filter(
        //   (log) =>
        //     log.hasOwnProperty("args") && log.fragment.name === "ListPostEvent"
        // );
        const followEvent = tx.events.hasOwnProperty('NewPostForFollower') && tx.events.hasOwnProperty('args') ? tx.events.NewPostForFollower : {};

        // Set the followEvent using the setFollowEvent function from the context
        setFollowEvent(followEvent);
      } else {
        console.error("Transaction failed");
      }
    } catch (error) {
      console.error("Error cancelling listing:", error);
    }
  };

  const handleBuyClick = async () => {
    // Implement your logic for buying the post
    console.log("Buy post logic goes here");
    try {
      if (!isCreator) {
        const listPrice = await contract.methods.getListPrice(postId).call();
        const prevOwner = await contract.methods.getOwnerName(postId).call(); 
        console.log("prevowner,", prevOwner, postId);
        const listofFollowers = await contract.methods.getFollowers(prevOwner).call(); 
        console.log("List of followrs",listofFollowers); 
        const tx = await contract.methods.buyPost(postId, { value: listPrice }).send({ from: address });
        //console.log("tx....", tx); 
        // const receipt = await tx.wait(); // Wait for the transaction to be mined
        if (tx.status === 1) {
          //Delete the posts from the prevOwner and its followers also. 
          
          try {
            const res = await axios.delete(`${host}/api/deletePost/${prevOwner}/${postId}`);
            //console.log(res.response)
          } catch (error) {
            console.log(error);
            showAlert("danger", "Error deleting PostData");
            return error;
          }
          
          for(let e of listofFollowers)
          {
            const res = await axios.delete(`${host}/api/deletePost/${e}/${postId}`);
          }
          const postData = await contract.methods.getSinglePost(postId).call();
          console.log("Deleted success", postData);
          try {
            const res = await axios.post(
              `${host}/api/postsFollowing`,
              {
                followerUsername: postData[1],
                NFTID: postData[0].toString(),
                username: postData[1],
                postText: postData[2],
                viewPrice: postData[3].toString(),
                isDeleted: postData[4],
                userWhoPaid: postData[10],
                hasListed: postData[11],
                listPrice: postData[12].toString(),
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          } catch (error) {
            console.log(error);
            showAlert("danger", "Error add PostData");
            return error;
          }
          const followEvent = receipt.logs.filter(
            (log) =>
              log.hasOwnProperty("args") && log.fragment.name === "ListPostEvent"
          );
          setFollowEvent(followEvent);
          console.log("Post Purchase successful");


        } else {
          console.error("Post Purchase failed");
        }
      }
    } catch (error) {
      console.error("Error buying the post:", error);
    }
  };

  const cancelList = async () => {
    console.log("Cancelling post listing");
    try {
      // Assuming your contract has a cancelListing method
      const tx = await contract.methods.cancelListing(postId).send({ from: address });
      // const receipt = await tx.wait();
      if (tx.status === 1) {

        const postData = await contract.methods.getSinglePost(postId).call();
        try {
          const res = await axios.post(
            `${host}/api/postsFollowing`,
            {
              followerUsername: postData[1],
              NFTID: postData[0].toString(),
              username: postData[1],
              postText: postData[2],
              viewPrice: postData[3].toString(),
              isDeleted: postData[4],
              userWhoPaid: postData[10],
              hasListed: postData[11],
              listPrice: postData[12].toString(),
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.log(error);
          showAlert("danger", "Error add PostData");
          return error;
        }

        const followEvent = receipt.logs.filter(
          (log) =>
            log.hasOwnProperty("args") && log.fragment.name === "CancelPostEvent"
        );

        // Set the followEvent using the setFollowEvent function from the context
        setFollowEvent(followEvent);
        console.log("Listing cancelled successfully");
        // Handle post-cancellation logic, e.g., updating state
      } else {
        console.error("Failed to cancel listing");
      }
    } catch (error) {
      console.error("Error cancelling listing:", error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const comments = await contract.methods.getPostComments(postId).call();
        setComments(comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [commentCount]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likes = await contract.methods.getLikesForPost(postId).call();
        setLikes(likes);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };
    fetchLikes();
  }, [postId]);

  const handleViewClick = async () => {
    if (!isCreator) {
      const tx = await contract.methods.viewPaidPost(postId, { value: price }).send({ from: address });
      // const receipt = await tx.wait(); // Wait for the transaction to be mined
      if (tx.status === 1) {
        console.log("Transaction successful");
        setIsBlurred(false);
      } else {
        console.error("Transaction failed");
      }
    }
  };

  const handleCommentPost = async () => {
    const comment = commentRef.current.value;
    if (!comment) {
      return;
    }
    try {
      const tx = await contract.methods.addComment(postId, comment).send({ from: address });
      // const receipt = await tx.wait();
      if (tx.status === 1) {
        console.log("Comment posted successfully");
        setCommentCount(!commentCount); // To trigger useEffect
      } else {
        console.error("Comment posting failed");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleLikeClick = async (postId) => {
    if (isLiked) {
      try {
        const tx = await contract.methods.unlikePost(postId).send({ from: address });
        // const receipt = await tx.wait();
        if (tx.status === 1) {
          console.log("Post Unliked successfully");
          setLikes((prevLikes) => BigInt(prevLikes) - 1n);
          localStorage.setItem(`liked-${address}-${postId}`, "false");
        } else {
          console.error("Post Unliking failed");
        }
      } catch (error) {
        console.error("Error liking post:", error);
      }
    } else {
      try {
        const tx = await contract.methods.likePost(postId).send({ from: address });
        // const receipt = await tx.wait();
        if (tx.status === 1) {
          localStorage.setItem(`liked-${address}-${postId}`, "true");
          setLikes((prevLikes) => BigInt(prevLikes) + 1n);
        } else {
          console.error("Post liking failed");
        }
      } catch (error) {
        console.error("Error liking post:", error);
      }
    }
  };

  const updatePostHandler = async (event) => {
    event.preventDefault();
    try {
      let content = {
        postText: editedText,
        viewPrice: parseFloat(editedPrice) * 100,
      };

      // Getting meta data of post which is saved in DB
      const data = await getPost(postId);
      const { uniqueID, ipfsHashes, encryptedFiles } = data[0];
      let receipt; 
      if (editedPrice > 0) {
        // Retrieving key from gatekeepers
        const retrievedShares = [];
        const gatekeepersCount = Number(import.meta.env.VITE_KEEPER_COUNT);
        for (let i = 0; i < gatekeepersCount; i++) {
          const response = await axios.get(
            `http://localhost:8080/api/gatekeepers/${i}/share/${uniqueID}`
          );
          retrievedShares.push(Buffer.from(response.data.share, "hex"));

          if (retrievedShares.length === Math.ceil((2 * gatekeepersCount) / 3))
            break;
        }

        let retrievedKey = combine(retrievedShares).toString();
        const ciphertext = CryptoJS.AES.encrypt(
          JSON.stringify(content),
          retrievedKey
        ).toString(); // Used AES to encrypt the content

        // Storing paid content to IPFS
        const res = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          { ciphertext, uniqueId: uniqueID, encryptedFiles },
          {
            headers: {
              pinata_api_key: import.meta.env.VITE_PINATA_KEY,
              pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
            },
          }
        );
        const ipfsHash = res.data.IpfsHash;

        // Store hash onto blockchain
        receipt = await contract.methods.editPost(
          postId,
          String(ipfsHash),
          parseInt(content.viewPrice)
        ).send({ from: address });
        // receipt = await tx.wait();
      } else {
        content.ipfsHashes = ipfsHashes;
        // console.log(content);

        // Storing free content to IPFS
        const res = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          {
            pinataContent: content,
            pinataMetadata: {
              name: uniqueID,
            },
          },
          {
            headers: {
              pinata_api_key: import.meta.env.VITE_PINATA_KEY,
              pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
            },
          }
        );
        const ipfsHash = res.data.IpfsHash;

        // Store hash onto blockchain
        receipt = await contract,methods.editPost(
          postId,
          String(ipfsHash),
          parseInt(content.viewPrice)
        ).send({ from: address });
        // receipt = await tx.wait();
      }
      if(receipt.status == 1)
      {
        //Now update in db for each user and its followers 
      const postData = await contract.methods.getSinglePost(postId).send({ from: address });
      console.log(postData);
      try {
        const res = await axios.post(
          `${host}/api/postsFollowing`,
          {
            followerUsername: postData[1],
            NFTID: postData[0].toString(),
            username: postData[1],
            postText: postData[2],
            viewPrice: postData[3].toString(),
            isDeleted: postData[4],
            userWhoPaid: postData[10],
            hasListed: postData[11],
            listPrice: postData[12].toString(),
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.log(error);
        showAlert("danger", "Error add PostData");
        return error;
      }
      const followEvent = receipt.logs.filter(
        (log) =>
          log.hasOwnProperty("args") && log.fragment.name === "NewPostForFollower"
      );
      setFollowEvent(followEvent);
      }
      

    } catch (error) {
      console.log(error);
      showAlert("danger", "Error updating post");
      return null;
    }
  };

  return (
    <div className="post">
      <div
        className={`viewButton ${
          !isCreator && isBlurred ? "visible" : "hidden"
        }`}
      >
        <div onClick={() => handleViewClick()}>
          <i
            className="bi bi-eye-slash fs-1 text-primary fw-bold ms-4"
            style={{ cursor: "pointer" }}
          ></i>
          <div>
            <a className="btn btn-info btn-sm">
              View Price{" "}
              <span className="badge text-bg-secondary">{price}</span>
            </a>
          </div>
        </div>
      </div>

      <div className={`post_content ${isBlurred ? "blurred" : ""}`}>
        <PostHelper
          displayName={displayName}
          text={text}
          price={price}
          decryptedFiles={decryptedFiles}
          ipfsHashes={ipfsHashes}
        />
        <div className="d-flex bg-body-tertiary rounded p-1 justify-content-around">
          <i
            className="bi bi-chat-left"
            data-bs-toggle="modal"
            data-bs-target={`#commentModal-${postId}`}
          ></i>

          {/* <i className="bi bi-heart">{likes > 0 && <span>{String(likes)}</span>}</i> */}
          <i
            className={`bi bi-heart${isLiked ? "-fill" : ""}`}
            style={{ color: isLiked ? "red" : "inherit" }}
            onClick={() => handleLikeClick(postId)}
          >
            {likes > 0 && <span>{String(likes)}</span>}
          </i>

          <i className="bi bi-flag"></i>
          {isCreator && (
            <i
              className="bi bi-pencil-square"
              data-bs-toggle="modal"
              data-bs-target={`#editModal-${postId}`}
            ></i>
          )}
          {isCreator && (
            <i className="bi bi-trash-fill" onClick={deletePostHandler}></i>
          )}
          {/* List Button and Price Input - shown only if user is the creator and post is not yet listed */}
          {isCreator && !hasListed && price != "0" && (
            <div className="listButton visible d-flex align-items-center gap-2">
              <input
                type="number"
                className="form-control"
                placeholder="Set Price"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                style={{ width: "100px" }} // Adjust width as needed
              />
              <button
                className="btn btn-primary"
                onClick={() => handleListClick(listPrice)}
              >
                List Post
              </button>
            </div>
          )}

          {/* Cancel Listing Button - shown only if user is the creator and the post is listed */}
          {isCreator && hasListed && (
            <div className="cancelListingButton visible">
              <button className="btn btn-warning" onClick={cancelList}>
                Cancel Listing
              </button>
            </div>
          )}

          {/* Buy Button - shown only if user is not the creator and post is listed */}
          {!isCreator && hasPaid && hasListed && (
            <div className="buyButton visible">
              <button className="btn btn-success" onClick={handleBuyClick}>
                Buy Post
              </button>
            </div>
          )}
        </div>

        {/* Modal for editing */}
        <div
          className="modal fade"
          id={`editModal-${postId}`}
          tabIndex="-1"
          aria-labelledby="editModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="editModalLabel">
                  Edit Post
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={updatePostHandler}>
                  <div className="mb-3">
                    <label htmlFor="editedText" className="form-label">
                      Text
                    </label>
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
                    <label htmlFor="editedPrice" className="form-label">
                      View Price
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      id="editedPrice"
                      value={editedPrice}
                      onChange={(e) => setEditedPrice(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill"
                  >
                    Update Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for view and commenting*/}
        <div
          className="modal fade"
          id={`commentModal-${postId}`}
          tabIndex="-1"
          aria-labelledby="commentModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="commentModalLabel">
                  Someone's Post
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <PostHelper
                  displayName={displayName}
                  text={text}
                  price={price}
                  decryptedFiles={decryptedFiles}
                  ipfsHashes={ipfsHashes}
                />
                <div className="d-flex bg-body-tertiary rounded p-1 justify-content-around">
                  <i
                    className="bi bi-chat-left"
                    data-bs-toggle="modal"
                    data-bs-target={`#commentModal-${postId}`}
                  ></i>
                  <i className="bi bi-heart"></i>
                  <i className="bi bi-flag"></i>
                  {isCreator && <i className="bi bi-pencil-square"></i>}
                  {isCreator && (
                    <i
                      className="bi bi-trash-fill"
                      onClick={deletePostHandler}
                    ></i>
                  )}
                </div>
                <hr />
                <span className="d-flex">
                  <input
                    className="form-control"
                    ref={commentRef}
                    type="text"
                    placeholder="Write a comment..."
                  />
                  <button
                    className="btn btn-success rounded-pill"
                    onClick={handleCommentPost}
                  >
                    Comment
                  </button>
                </span>

                {comments.map((comment) => (
                  <div key={comment} className="p-1 bg-body-tertiary rounded-2">
                    <div className="d-flex justify-content-start">
                      <img
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Profile"
                        style={{
                          height: "50px",
                          width: "50px",
                          borderRadius: "50%",
                          marginRight: "10px",
                        }}
                      />
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
