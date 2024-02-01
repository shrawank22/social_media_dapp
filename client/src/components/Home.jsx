import { useState, useEffect } from 'react'

import PostContainer from './PostContainer';
import Post from './Post';
import axios from 'axios';

const Home = ({ state }) => {

    const { contract, address } = state;

    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getAllPosts();
    }, [address]);

    const getAllPosts = async () => {
        try {
            setIsLoading(true);
            if (contract) {
                let allPosts = await contract.getAllPosts();
                // console.log(allPosts);

                // Fetching text from IPFS for each post
                const postsWithData = await Promise.all(
                    allPosts.map(async (post) => {
                        const { postText, viewPrice } = await fetchTextFromIPFS(post.postText);
                        // console.log(postText, viewPrice)
                        return { ...post, postText, viewPrice };
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
            await contract.deletePost(key);
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <>
            <div className="feed-header">
                <h2>Home</h2>
            </div>
            <PostContainer state={state} />

            {isLoading ? (
                <div>Loading...</div> // Loading indicator
            ) : (
                <>
                    {posts.map((post) => (
                        // console.log(post.id)
                        <Post
                            key={post[0]}
                            displayName={post[1]}
                            text={post.postText}
                            price={Number(post.viewPrice) / 100}
                            onClick={deletePost(post[0])}
                            isCreator={address === post[1]}
                        />
                    ))}
                </>
            )}
        </>
    );
}

export default Home;

