import { useState, useEffect } from 'react'
import './CommonCSS.css';

import PostContainer from './PostContainer';
import FlipMove from 'react-flip-move'
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
                let allPosts = await contract.getAllposts();
                // console.log(allPosts[0].postText);

                // Fetching text from IPFS for each post
                const postsWithData = await Promise.all(
                    allPosts.map(async (post) => {
                        const postText = await fetchTextFromIPFS(post.postText);
                        return { ...post, postText };
                    })
                );

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
            window.location.reload();

        } catch (error) {
            console.log(error);
        }
    }


    return (
        <div className="feed">
            <div className="feed-header">
                <h2>Home</h2>
            </div>
            <PostContainer state={state} />

            {isLoading ? (
                <div>Loading...</div> // Loading indicator
            ) : (
                <>
                    <FlipMove>
                        {posts.map((post) => (
                            // console.log(post.username, address)  // giving undefined don't know why
                            <Post
                                key={post[0]}
                                displayName={post[1]}
                                text={post.postText.text}
                                price={Number(post.postText.viewPrice) / 100}
                                onClick={deletePost(post[0])}
                                isCreator={address === post.username}
                            />
                        ))}
                    </FlipMove>
                </>
            )}
        </div>
    );
}

export default Home;

