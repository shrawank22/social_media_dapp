import PostContext from "./postContext";
import { useState, useEffect } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import { Buffer, split, combine } from "shamirs-secret-sharing";

import postContext from "./postContext";
import Post from "../../components/Post";
import { useEthereumConnectClient } from "../EthereumContext";

const PostState = ({ children }) => {
  const host = "http://localhost:8080";

  //------------------------------ Web3 Context ------------------------------
  const { state } = useEthereumConnectClient();
  const { contract, address } = state;

  //--------------------------------- States ---------------------------------
  const [alert, setAlert] = useState(null);
  const [postText, setPostText] = useState("");
  const [loader, setLoader] = useState(true);

  const [viewPrice, setViewPrice] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileURLs, setFileURLs] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false); // Just to trigger useEffect when post is added
  const [posts, setPosts] = useState([]);
  const gatekeepersCount = Number(import.meta.env.VITE_KEEPER_COUNT);
  const [followEvent, setFollowEvent] = useState([]);
  const serializeBigInt = (key, value) => {
    if (typeof value === "bigint") {
      return { type: "BigInt", value: value.toString() };
    }
    return value;
  };

  async function checkPlagiarism(content) {
    const text1 = content.postText;
    const numPerm = 128;
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/check_plagiarism', {
        text1: text1,
        num_perm: numPerm
      });
  
      const plagiarism = response.data.plagiarism;
      if (plagiarism) {
        showAlert("danger", "Plag Found!! Please edit the post content and make a new post");
        setLoader(false);
        console.log("Plagiarism detected! Please create a new post.");
        return null;
      } else {
        console.log("No plagiarism detected. Post created successfully.");
        // Continue with post creation logic here
        // ...
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function checkPlagiarismImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
  
      const response = await axios.post('http://127.0.0.1:5000/check_plagiarism_image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      console.log(response);
      const plagiarism = response.data.plagiarism;
      if (plagiarism) {
        showAlert("danger", "Plag Found!! Please edit the post content and make a new post");
        console.log("Plagiarism detected! Please create a new post.");
        return null;
      } else {
        console.log("No plagiarism detected. Image created successfully.");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }


  <postContext.Provider value={followEvent}>
    <Post />
  </postContext.Provider>;

  //------------------------------ useEffect hooks ------------------------------
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (contract) {
          console.log("followEvent: ", followEvent);
          for (let e of followEvent) {
            const follower = e.returnValues[0];
            const user = e.returnValues[1];
            const id = e.returnValues[2];
            // const follower = e.args[0];
            // const user = e.args[1];
            // const id = e.args[2];
            if (user === address) {
              const postData = await contract.methods.getSinglePost(id).call();
              console.log(postData);
              console.log(follower);
              //console.log(postData);

              try {
                const res = await axios.post(
                  `${host}/api/postsFollowing`,
                  {
                    followerUsername: follower,
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
            }
          }
          let posts;
          try {
            const limit = 100;
            const response = await axios.get(
              `${host}/api/topPosts/${address}/${limit}`
            );
            posts = response.data;
            console.log(posts);
          } catch (error) {
            console.error("Error fetching top posts:", error);
            throw error;
          }

          //old method of fetching posts
          //let allPosts = await contract.getAllPosts();
          let allPosts = posts;
          
          for(let p of allPosts.posts)
          {
            let postId = p.NFTID
            let postData = await contract.methods.getSinglePost(postId).call();
            //console.log(p)
            let arr2, arr1; 
            arr2 = [postData[0].toString(), postData[1],postData[2], postData[3].toString(), postData[4], postData[11], postData[12].toString()]
            //console.log("arr2:",arr2)
            arr1 = [p.NFTID,p.username,p.postText, p.viewPrice.toString(),p.isDeleted ,p.hasListed, p.listPrice.toString()]
            //console.log("arr1:", arr1) 
           
            let isequal = arr1.length === arr2.length && arr1.every(item => arr2.includes(item));
            if(isequal)
            console.log("All good to go with post id",p.NFTID);
            else
            {console.log("Post has been maniupoulated"); 
            showAlert("danger", "Post with id", p.NFTID ,"has been manipulated");
            }
          }

          //let allPosts = await contract.getAllPosts();
          // let allPosts = await contract.getFollowedUsersPosts();
          //console.log("allposts",allPosts);

          // Fetching text from IPFS for each post
          const postsWithData = await Promise.all(
            allPosts.posts.map(async (post) => {
              if (post.viewPrice > 0) {
                const { ciphertext, uniqueId, encryptedFiles, price } =
                  await fetchTextFromIPFS(post.postText);

                let usersWhoPaid = await contract.methods.getPaidUsersByPostId(
                  post.NFTID
                ).call();
                const hasPaid = usersWhoPaid.includes(address);
                // console.log(hasPaid, post.username === address)

                // If Paid Post is created by the user itself
                if (post.username === address || hasPaid) {
                  const { postText, viewPrice, decryptedFiles } =
                    await retrieveDecryptedContent(
                      uniqueId,
                      ciphertext,
                      encryptedFiles
                    );
                  return {
                    ...post,
                    postText,
                    viewPrice,
                    decryptedFiles,
                    hasPaid,
                  };
                } else {
                  return {
                    ...post,
                    postText: "Paid Post",
                    viewPrice: price,
                    hasPaid: false,
                  };
                }
              } else {
                const { postText, viewPrice, ipfsHashes } =
                  await fetchTextFromIPFS(post.postText);
                // console.log(postText, viewPrice, ipfsHashes)
                return {
                  ...post,
                  postText,
                  viewPrice,
                  ipfsHashes,
                  hasPaid: true,
                };
              }
            })
          );
          const reversedPostsWithData = postsWithData.reverse();
          setPosts(reversedPostsWithData);
          setLoader(false);
        }
      } catch (error) {
        console.log(error);
        setLoader(false);

      }
    };

    fetchPosts();
    return () => {
      if (contract) {
        contract.removeAllListeners("NewPostForFollower");
      }
    };
  }, [state, posted, contract, address, followEvent]);

  //--------------------------------- API Calls ---------------------------------
  const getPost = async (id) => {
    try {
      const res = await axios.get(`${host}/api/posts/${id}`);
      return res.data;
    } catch (error) {
      console.log(error);
      showAlert("danger", "Error fetching posts");
    }
  };

  const deletePost = async (id) => {
    try {
      const res = await axios.delete(`${host}/api/posts/${id}`);
      const owner = await contract.methods.getOwnerName(id).call(); 
      const listofFollowers = await contract.methods.getFollowers(owner).call(); 
      const res2 = await axios.delete(`${host}/api/deletePost/${owner}/${id}`);
      for(let e of listofFollowers)
      {
        const res3 = await axios.delete(`${host}/api/deletePost/${e}/${id}`);
      }
      return res.data;
    } catch (error) {
      console.log(error);
      showAlert("danger", "Error deleting post");
      return error;
    }
  };

  const postPost = async (post) => {
    try {
      // console.log(post);
      const res = await axios.post(`${host}/api/posts`, post, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error) {
      console.log(error);
      showAlert("danger", "Error posting post");
      return error;
    }
  };

  //--------------------------------- Functions ---------------------------------
  const showAlert = (type, message) => {
    setAlert({
      type: type,
      msg: message,
    });
    setTimeout(() => {
      setAlert(null);
      // window.location.reload();
    }, 5000);
  };

  const handleFileEncrypt = (key) => {
    const encryptedFilesArray = [];

    selectedFiles.forEach((file) => {

      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target.result;
        const base64Content = btoa(fileContent);
        const encryptedContent = CryptoJS.AES.encrypt(
          base64Content,
          key
        ).toString();
        encryptedFilesArray.push(encryptedContent);
      };
      reader.readAsBinaryString(file);
    });
    return encryptedFilesArray;
  };

  const handleFileDecrypt = (key, encryptedFiles) => {
    const decryptedFilesArray = [];

    encryptedFiles.forEach((encryptedFile, index) => {
      const decryptedContent = CryptoJS.AES.decrypt(
        encryptedFile,
        key
      ).toString(CryptoJS.enc.Utf8);
      const binaryContent = atob(decryptedContent);
      const byteArray = new Uint8Array(binaryContent.length);

      for (let i = 0; i < binaryContent.length; i++) {
        byteArray[i] = binaryContent.charCodeAt(i);
      }

      const decryptedBlob = new Blob([byteArray], { type: "image/jpeg" });
      decryptedFilesArray.push(URL.createObjectURL(decryptedBlob));
    });

    return decryptedFilesArray;
  };


  const fetchTextFromIPFS = async (ipfsHash) => {
    try {
      // const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);
      const response = await axios.get(
        `https://brown-bright-emu-470.mypinata.cloud/ipfs/${ipfsHash}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching text from IPFS:", error);
      showAlert("danger", "Error fetching text from IPFS");
      return null;
    }
  };

  const addPostHandler = async (event) => {
    event.preventDefault();
    setIsPosting(true);
    try {
      console.log("Trying to add a post");
      if (postText === "" || viewPrice === "") {
        console.log("Input fields can't be empty");
      } else {
        let content = {
          postText: postText,
          viewPrice: parseFloat(viewPrice) * 100,
        };

        const uniqueId = uuidv4();

        if (content.viewPrice > 0) {

          //check for plag here: 

          const result = await checkPlagiarism(content);
          if (result === null) {
            return; 
          }

          // Encrypt the content and split the key
          let key = CryptoJS.lib.WordArray.random(256 / 8).toString(); // Generate a random encryption key
          const ciphertext = CryptoJS.AES.encrypt(
            JSON.stringify(content),
            key
          ).toString();

          // Encrypt all the selected files
          let encryptedFiles = [];
          if (selectedFiles) {

            //handling image plagirism 
            for (const file of selectedFiles) { 
              const result = await checkPlagiarismImage(file);
              if (result === null) {
                // Plagiarism detected, handle accordingly
                return;
              }
            }
            encryptedFiles = handleFileEncrypt(key);
          }

          // Split the key into parts
          const { gatekeepers, gatekeepersCount } = await fetchGatekeepers();
          const shares = split(Buffer.from(key), {
            shares: parseInt(gatekeepersCount),
            threshold: Math.ceil((parseInt(gatekeepersCount) * 2) / 3),
          });

          const keyShares = shares.map((share) => share.toString("hex"));

          // Send each share to a different gatekeeper
          for (let i = 0; i < gatekeepersCount; i++) {
            await axios.post(
              `http://${gatekeepers[i].ip}:${gatekeepers[i].port}/api/gatekeepers/${i}/share/${uniqueId}`,
              { share: keyShares[i] },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }

          // Storing paid content to IPFS
          let price = content.viewPrice;
          const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            { ciphertext, price, uniqueId, encryptedFiles },
            {
              headers: {
                pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
              },
            }
          );
          console.log(res.data.IpfsHash);
          const ipfsHash = res.data.IpfsHash;

          // Store hash onto blockchain
          const tx = await contract.methods.addPost(
            String(ipfsHash),
            parseInt(content.viewPrice)
          ).send({ from: address, gasPrice: '30000000000' });

          console.log("add post 1");
          // const receipt = await tx.wait();
          // console.log(receipt.logs);

          // Storing some info about post to DB
          // const addPostEvent = tx.events.find(
          //   (log) => log.fragment.name === "AddPost"
          // );
          //const postId = addPostEvent.args[1].toString();
          const addPostEvent = tx.events.hasOwnProperty('AddPost') ? tx.events.AddPost : {};
          console.log("addPostEvent: ", addPostEvent);

          const username = addPostEvent.returnValues[0].toString();
          const postId = addPostEvent.returnValues[1].toString();

          const postData = await contract.methods.getSinglePost(postId).call();
          console.log("Here is the details of my new post..", postData);
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

          // const followEvent = receipt.logs.filter(
          //   (log) =>
          //     log.hasOwnProperty("args") &&
          //     log.fragment.name === "NewPostForFollower"
          // );
          console.log("tx.events: ", tx.events);
          const followEvent = tx.events.hasOwnProperty('NewPostForFollower') ? tx.events.NewPostForFollower : {};
          console.log("followEvent: ", followEvent);
          setFollowEvent(followEvent);

          if (encryptedFiles.length === 0) {
            postPost({ NFTID: postId, uniqueID: uniqueId });
          } else {
            postPost({ NFTID: postId, uniqueID: uniqueId, encryptedFiles });
          }
        } else {
          const ipfsHashes = [];
          for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append(
              "pinataMetadata",
              JSON.stringify({ name: file.name })
            );

            const res = await axios.post(
              "https://api.pinata.cloud/pinning/pinFileToIPFS",
              formData,
              {
                maxBodyLength: "Infinity",
                headers: {
                  "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                  pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                  pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                },
              }
            );
            const ipfsHash = res.data.IpfsHash;
            ipfsHashes.push(ipfsHash);
          }

          content.ipfsHashes = ipfsHashes;

          // Storing free content to IPFS
          const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            {
              pinataContent: content,
              pinataMetadata: {
                name: uniqueId,
              },
            },
            {
              headers: {
                pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
              },
            }
          );
          console.log(res.data.IpfsHash);
          const ipfsHash = res.data.IpfsHash;

          // Store hash onto blockchain
          const tx = await contract.methods.addPost(
            String(ipfsHash),
            parseInt(content.viewPrice)
          ).send({ from: address, gasPrice: '30000000000' });
          // const receipt = await tx.wait();

          console.log("add post 2");

          // Storing some info about post to DB
          // const addPostEvent = receipt.logs.find(
          //   (log) => log.fragment.name === "AddPost"
          // );
          //const postId = addPostEvent.args[1].toString();
          const addPostEvent = tx.events.hasOwnProperty('AddPost') ? tx.events.AddPost : {};
          console.log("addPostEvent: ", addPostEvent);

          const username = addPostEvent.returnValues[0].toString();
          const postId = addPostEvent.returnValues[1].toString();

          const postData = await contract.methods.getSinglePost(postId).call();
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

          // const followEvent = receipt.logs.filter(
          //   (log) =>
          //     log.hasOwnProperty("args") &&
          //     log.fragment.name === "NewPostForFollower"
          // );
          console.log("tx.events : ", tx.events);
          const followEvent = tx.events.hasOwnProperty('NewPostForFollower') && tx.events.hasOwnProperty('args') ? tx.events.NewPostForFollower : {};
          console.log("followEvent: ", followEvent);
          setFollowEvent(followEvent);

          if (ipfsHashes.length === 0) {
            postPost({ NFTID: postId, uniqueID: uniqueId });
          } else {
            postPost({
              NFTID: postId,
              uniqueID: uniqueId,
              ipfsHashes: ipfsHashes,
            });
          }
        }

        // Resetting inputs
        setPostText("");
        setViewPrice("");
        setSelectedFiles([]);
        setFileURLs([]);
        setIsPosting(false);
        setPosted(!posted);
      }
    } catch (err) {
      console.log(err);
      showAlert("danger", "Error adding post");
    }
  };

  const retrieveDecryptedContent = async (
    uniqueId,
    ciphertext,
    encryptedFiles
  ) => {
    // Retrieve the shares from the gatekeepers
    const retrievedShares = [];

    const { gatekeepers, gatekeepersCount } = await fetchGatekeepers();

    for (let i = 0; i < gatekeepersCount; i++) {
      const response = await axios.get(
        `http://${gatekeepers[i].ip}:${gatekeepers[i].port}/api/gatekeepers/${i}/share/${uniqueId}`,
        {
          params: {
            address: address,
          },
        }
      );
      retrievedShares.push(Buffer.from(response.data.share, "hex"));
      if (
        retrievedShares.length ===
        Math.ceil((2 * parseInt(gatekeepersCount)) / 3)
      )
        break;
    }

    // for (let i = 0; i < gatekeepersCount; i++) {
    //     const response = await axios.get(`http://localhost:8080/api/gatekeepers/${i}/share/${uniqueId}`, {
    //         params: {
    //             address: address
    //         }
    //     });
    //     retrievedShares.push(Buffer.from(response.data.share, 'hex'));
    //     if (retrievedShares.length === Math.ceil(2 * gatekeepersCount / 3)) break;
    // }

    let retrievedKey = combine(retrievedShares).toString();
    // console.log(retrievedKey)

    // Retrieving content with retrieved key
    const bytes = CryptoJS.AES.decrypt(ciphertext, retrievedKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // Retrieving encrypted files
    const decryptedFiles = handleFileDecrypt(retrievedKey, encryptedFiles);
    const { postText, viewPrice } = JSON.parse(decrypted);

    return { postText, viewPrice, decryptedFiles };
  };

  const fetchGatekeepers = async () => {
    try {
      const gatekeepersCount = await contract.methods.getGatekeepersCount().call();
      let gatekeepers = [];
      for (let i = 0; i < gatekeepersCount; i++) {
        let { ip, port } = await contract.methods.getGatekeeper(i).call();
        gatekeepers.push({ ip, port });
      }
      return { gatekeepers, gatekeepersCount };
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  return (
    <PostContext.Provider
      value={{
        alert,
        showAlert,
        getPost,
        deletePost,
        postPost,
        addPostHandler,
        postText,
        viewPrice,
        fileURLs,
        isPosting,
        setFileURLs,
        setSelectedFiles,
        setPostText,
        setViewPrice,
        posts,
        setPosts,
        setFollowEvent,
        followEvent,
        setLoader,
        loader,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
export default PostState;
