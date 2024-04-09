import PostContext from "./postContext";
import { useState, useContext, useEffect } from "react";
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid';
import { Buffer, split, combine } from 'shamirs-secret-sharing'

import web3Context from '../web3/web3Context';

const PostState = ({ children }) => {
    const host = "http://localhost:8080"

    //------------------------------ Web3 Context ------------------------------
    const context = useContext(web3Context);
    const { state } = context;
    const { contract, address, signer, provider } = state;

    //--------------------------------- States ---------------------------------
    const [alert, setAlert] = useState(null);
    const [postText, setPostText] = useState('');
    const [viewPrice, setViewPrice] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileURLs, setFileURLs] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [posted, setPosted] = useState(false); // Just to trigger useEffect when post is added
    const [posts, setPosts] = useState([])
    const gatekeepersCount = Number(import.meta.env.VITE_KEEPER_COUNT);

    //------------------------------ useEffect hooks ------------------------------
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                if (contract) {
                    let allPosts = await contract.getAllPosts();
                    // let allPosts = await contract.getFollowedUsersPosts();
                    // console.log(allPosts);

                    // Fetching text from IPFS for each post
                    const postsWithData = await Promise.all(
                        allPosts.map(async (post) => {
                            if (post.viewPrice > 0) {
                                const { ciphertext, uniqueId, encryptedFiles, price } = await fetchTextFromIPFS(post.postText);

                                let usersWhoPaid = await contract.getPaidUsersByPostId(post.id);
                                const hasPaid = usersWhoPaid.includes(address);

                                // If Paid Post is created by the user itself
                                if (post[1] === address || hasPaid) {
                                    const { postText, viewPrice, decryptedFiles } = await retrieveDecryptedContent(uniqueId, ciphertext, encryptedFiles);
                                    return { ...post, postText, viewPrice, decryptedFiles, hasPaid }
                                } else {
                                    return { ...post, postText: "Paid Post", viewPrice: price, hasPaid: false }
                                }
                            } else {
                                const { postText, viewPrice, ipfsHashes } = await fetchTextFromIPFS(post.postText);
                                // console.log(postText, viewPrice, ipfsHashes)
                                return { ...post, postText, viewPrice, ipfsHashes, hasPaid: true };
                            }
                        })
                    );
                    const reversedPostsWithData = postsWithData.reverse();
                    setPosts(reversedPostsWithData);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchPosts();
    }, [state, posted]);

    //--------------------------------- API Calls ---------------------------------
    const getPost = async (id) => {
        try {
            const res = await axios.get(`${host}/api/posts/${id}`);
            return res.data;
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error fetching posts")
        }
    }

    const deletePost = async (id) => {
        try {
            const res = await axios.delete(`${host}/api/posts/${id}`);
            return res.data;
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error deleting post")
            return error;
        }
    }

    const postPost = async (post) => {
        try {
            // console.log(post);
            const res = await axios.post(`${host}/api/posts`, post, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return res.data;
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error posting post")
            return error;
        }
    }

    //--------------------------------- Functions ---------------------------------
    const showAlert = (type, message) => {
        setAlert({
            type: type,
            msg: message
        });
        setTimeout(() => {
            setAlert(null);
        }, 1500);
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

    const handleFileDecrypt = (key, encryptedFiles) => {
        const decryptedFilesArray = [];

        encryptedFiles.forEach((encryptedFile, index) => {
            const decryptedContent = CryptoJS.AES.decrypt(encryptedFile, key).toString(CryptoJS.enc.Utf8);
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
            const response = await axios.get(`https://brown-bright-emu-470.mypinata.cloud/ipfs/${ipfsHash}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching text from IPFS:', error);
            showAlert("danger", "Error fetching text from IPFS");
            return null;
        }
    }

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
                    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(content), key).toString();

                    // Encrypt all the selected files
                    let encryptedFiles = [];
                    if (selectedFiles) {
                        encryptedFiles = handleFileEncrypt(key);
                    }

                    // Split the key into parts
                    const { gatekeepers, gatekeepersCount } = await fetchGatekeepers();
                    const shares = split(Buffer.from(key), { shares: parseInt(gatekeepersCount), threshold: Math.ceil(parseInt(gatekeepersCount) * 2 / 3) });

                    const keyShares = shares.map(share => share.toString('hex'))

                    // Send each share to a different gatekeeper
                    for (let i = 0; i < gatekeepersCount; i++) {
                        await axios.post(`http://${gatekeepers[i].ip}:${gatekeepers[i].port}/api/gatekeepers/${i}/share/${uniqueId}`, { share: keyShares[i] }, {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        });
                    }

                    // Storing paid content to IPFS
                    let price = content.viewPrice
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", { ciphertext, price, uniqueId, encryptedFiles }, {
                        headers: {
                            pinata_api_key: import.meta.env.VITE_PINATA_KEY,
                            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                        },
                    });
                    console.log(res.data.IpfsHash);
                    const ipfsHash = res.data.IpfsHash;

                    // Store hash onto blockchain
                    const tx = await contract.addPost(String(ipfsHash), parseInt(content.viewPrice));
                    const receipt = await tx.wait();
                    // console.log(receipt.logs);

                    // Storing some info about post to DB
                    const addPostEvent = receipt.logs.find(log => log.fragment.name === 'AddPost');
                    const postId = addPostEvent.args[1].toString();
                    if (encryptedFiles.length === 0) {
                        postPost({ NFTID: postId, uniqueID: uniqueId });
                    } else {
                        postPost({ NFTID: postId, uniqueID: uniqueId, encryptedFiles });
                    }
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
                    const tx = await contract.addPost(String(ipfsHash), parseInt(content.viewPrice));
                    const receipt = await tx.wait();

                    // Storing some info about post to DB
                    const addPostEvent = receipt.logs.find(log => log.fragment.name === 'AddPost');
                    const postId = addPostEvent.args[1].toString();
                    if (ipfsHashes.length === 0) {
                        postPost({ NFTID: postId, uniqueID: uniqueId });
                    } else {
                        postPost({ NFTID: postId, uniqueID: uniqueId, ipfsHashes: ipfsHashes });
                    }
                }

                // Resetting inputs
                setPostText('');
                setViewPrice('');
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

    const retrieveDecryptedContent = async (uniqueId, ciphertext, encryptedFiles) => {
        // Retrieve the shares from the gatekeepers
        const retrievedShares = [];

        const { gatekeepers, gatekeepersCount } = await fetchGatekeepers();
        
        for (let i = 0; i < gatekeepersCount; i++) {
            const response = await axios.get(`http://${gatekeepers[i].ip}:${gatekeepers[i].port}/api/gatekeepers/${i}/share/${uniqueId}`, {
                params: {
                    address: address
                }
            });
            retrievedShares.push(Buffer.from(response.data.share, 'hex'));
            if (retrievedShares.length === Math.ceil(2 * parseInt(gatekeepersCount) / 3)) break;
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

        return { postText, viewPrice, decryptedFiles }
    }

    const fetchGatekeepers = async () => {
        try {
            const gatekeepersCount = await contract.getGatekeepersCount();
            let gatekeepers = [];
            for (let i = 0; i < gatekeepersCount; i++) {
                let { ip, port } = await contract.getGatekeeper(i);
                gatekeepers.push({ ip, port });
            }
            return { gatekeepers, gatekeepersCount };
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    return (
        <PostContext.Provider value={{
            alert, showAlert, getPost, deletePost, postPost, addPostHandler,
            postText, viewPrice, fileURLs, isPosting, setFileURLs, setSelectedFiles,
            setPostText, setViewPrice, posts, setPosts
        }}>
            {children}
        </PostContext.Provider>
    )

}
export default PostState;