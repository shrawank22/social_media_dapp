import './AllSidebar.css';
import { useState, useEffect } from 'react'
import {Web3} from 'web3'
import SocialMediaContract from './blockchain/SocialMediaContract'
import PostContainer from './PostContainer';
import FlipMove from 'react-flip-move'
import Post from './Post';
import axios from 'axios';


const HomeComponent = () => {
  const [, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [socialContract, setSocialContract] = useState(null)
  const [posts, setPosts] = useState([])  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    connectWalletHandler();
  }, [address]);

  const getAllPosts = async () => {
    try {
      setIsLoading(true);
      if (socialContract) {
        let allPosts = await socialContract.methods.getAllposts().call();
        // console.log(allPosts[4].postText);
        
        // Fetching text from IPFS for each post
        const postsWithData = await Promise.all(
          allPosts.map(async (post) => {
            const postText = await fetchTextFromIPFS(post.postText); 
            return { ...post, postText };
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

  const connectWalletHandler = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
      
        const web3 = new Web3(window.ethereum)
       
        setWeb3(web3)
        
        const accounts = await web3.eth.getAccounts()
        
        setAddress(accounts[0])
        
        const contract1 = SocialMediaContract(web3)
        setSocialContract(contract1)
        getAllPosts();
      } catch(err) {
          console.log(err);
      }
    } else {
      console.log("Please install MetaMask")
    }
  }

  const fetchTextFromIPFS = async (ipfsHash) => {
    try {
      const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching text from IPFS:', error);
      return null;
    }
  }

  const deletePost = key => async() => {
    try {
        await socialContract.methods.deletePost(key).send({
          from: address
        });
        window.location.reload();
        
      }  catch(error) {
      console.log(error);
    }
  }

  // const deletePost = key => async () => {
  //   try {
  //     await socialContract.methods.deletePost(key).send({
  //       from: address
  //     });
  //     let allPosts = await socialContract.methods.getAllposts().call();
  //     setPosts(allPosts);
  //   } catch(error) {
  //     if (error && error.message) {
  //       // Extract the revert reason from the error message
  //       const revertReason = extractRevertReason(error.message);
  //       alert(revertReason || 'An error occurred');
  //     } else {
  //       console.log(error);
  //     }
  //   }
  // }

  // const extractRevertReason = (errorMessage) => {
  //   const result = /revert (.*)/.exec(errorMessage);
  //   return result && result[1] ? result[1] : null;
  // }
  

  return ( 
    <div className="feed">
      <div className="feed-header">
        <h2>Home</h2> 
      </div>
      <PostContainer />

      {isLoading ? (
        <div>Loading...</div> // Loading indicator
      ) : (
      <>
        <FlipMove>
        {posts.map((post) => (
            // console.log(post.username, address)  // giving undefined don't know why
            <Post
              key={post.id}
              displayName={post.username}
              text={post.postText.text}
              price={Number(post.viewPrice) / 100}
              onClick={deletePost(post.id)}
              isCreator={address === post.username}
            />
          ))}
        </FlipMove>
      </>
      )}
    </div>
  );
}

export default HomeComponent;

