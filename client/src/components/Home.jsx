import { useState, useEffect } from 'react'

import PostContainer from './PostContainer';
import Post from './Post';
import axios from 'axios';
import CryptoJS from 'crypto-js'
import { Buffer, combine } from 'shamirs-secret-sharing'

const Home = ({ state }) => {

    const { contract, address } = state;

    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getAllPosts();
    }, [address]);

    const handleFileDecrypt = (key, encryptedFiles) => {
        const decryptedFilesArray = [];

        encryptedFiles.forEach((encryptedFile, index) => {
            const decryptedContent = CryptoJS.AES.decrypt(encryptedFile, key).toString(CryptoJS.enc.Utf8);
            const binaryContent = atob(decryptedContent);
            const byteArray = new Uint8Array(binaryContent.length);

            for (let i = 0; i < binaryContent.length; i++) {
                byteArray[i] = binaryContent.charCodeAt(i);
            }

            // const decryptedBlob = new Blob([byteArray], { type: "selectedFiles[index].type" });
            const decryptedBlob = new Blob([byteArray], { type: "image/jpeg" });
            decryptedFilesArray.push(URL.createObjectURL(decryptedBlob));
        });

        return decryptedFilesArray;
    };

    const getAllPosts = async () => {
        try {
            setIsLoading(true);
            if (contract) {
                let allPosts = await contract.getAllPosts();
                // console.log(allPosts);

                // Fetching text from IPFS for each post
                const postsWithData = await Promise.all(
                    allPosts.map(async (post) => {
                        if (post.viewPrice > 0) {
                            const { ciphertext, uniqueId, encryptedFiles } = await fetchTextFromIPFS(post.postText);
                            console.log(ciphertext, uniqueId, encryptedFiles);

                            // Retrieve the shares from the gatekeepers
                            const retrievedShares = [];
                            const gatekeepersCount = Number(import.meta.env.VITE_KEEPER_COUNT);
                            for (let i = 0; i < gatekeepersCount; i++) {
                                const response = await axios.get(`http://localhost:8080/api/gatekeepers/${i}/share/${uniqueId}`);
                                retrievedShares.push(Buffer.from(response.data.share, 'hex'));

                                if (retrievedShares.length === Math.ceil(2 * gatekeepersCount / 3)) break;
                            }

                            let retrievedKey = combine(retrievedShares).toString();
                            // console.log(retrievedKey)

                            // Retrieving content with retrieved key
                            const bytes = CryptoJS.AES.decrypt(ciphertext, retrievedKey);
                            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                            // console.log("Decrypted Content ", decrypted)

                            // Retrieving encrypted files
                            const decryptedFiles = handleFileDecrypt(retrievedKey, encryptedFiles);
                            const { postText, viewPrice } = JSON.parse(decrypted)
                            
                            let usersWhoPaid = await contract.getPaidUsersByPostId(post.id);
                            const hasPaid = usersWhoPaid.includes(address);
                            console.log(hasPaid);

                            return { ...post, postText, viewPrice, decryptedFiles, hasPaid, ipfsHashes:[] }



                        } else {
                            const { postText, viewPrice, ipfsHashes } = await fetchTextFromIPFS(post.postText);
                            // console.log(postText, viewPrice, ipfsHashes)
                            return { ...post, postText, viewPrice, ipfsHashes, hasPaid: true, decryptedFiles: [] };
                        }
                    })
                );

                // console.log(postsWithData)

                setPosts(postsWithData);
                setIsLoading(false);
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    const fetchTextFromIPFS = async (ipfsHash) => {
        try {
            const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching text from IPFS:', error);
            return null;
        }
    }

    const deletePost = key => async () => {
        try {
            const receipt = await contract.deletePost(key);
            await receipt.wait();
            setPosts(posts.filter(post => post[0] !== key));
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <>
            <div className="feed-header">
                <h2>Home</h2>
            </div>
            <PostContainer state={state} getAllPosts={getAllPosts}/>

            {isLoading ? (
                <div>Loading...</div> // Loading indicator
            ) : (
                <>
                    {posts.map((post) => (
                        // console.log(post)
                        <Post
                            key={post[0]}
                            displayName={post[1]}
                            text={post.postText}
                            price={Number(post.viewPrice) / 100}
                            onClick={deletePost(post[0])}
                            isCreator={address === post[1]}
                            postId = {post[0]}
                            state = {state}
                            hasPaid={post.hasPaid}
                            decryptedFiles = {post.decryptedFiles}
                            ipfsHashes = {post.ipfsHashes}
                        />
                    ))}
                </>
            )}
        </>
    );
}

export default Home;

