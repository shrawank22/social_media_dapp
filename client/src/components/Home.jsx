import { useContext } from 'react'

import PostContainer from './PostContainer';
import Post from './Post';
import postContext from '../context/post/postContext';
import web3Context from '../context/web3/web3Context';

const Home = () => {
    const context1 = useContext(postContext);
    const context2 = useContext(web3Context);
    const { showAlert, deletePost, posts, setPosts } = context1;
    const { state } = context2;
    const { contract, address } = state;

    
    const deletePostHandler = key => async () => {
        try {
            const usersWhoPaid = await contract.getPaidUsersByPostId(key);
            if (usersWhoPaid.length > 0) {
                showAlert("danger", "You cannot delete a post that has been paid for");
                return null;
            }

            const receipt = await contract.deletePost(key);
            await receipt.wait();
            setPosts(posts.filter(post => post[0] !== key));
            deletePost(key);
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error deleting post");
            return null;
        }
    }


    return (
        <>
            <div className="feed-header">
                <h2>Home</h2>
            </div>
            <PostContainer />

            {posts.map((post) => (
                // console.log(post)
                // <Post
                //     key={post[0]}
                //     displayName={post[1]}
                //     text={post.postText}
                //     price={Number(post.viewPrice) / 100}
                //     deletePostHandler={deletePostHandler(post[0])}
                //     isCreator={address === post[1]}
                //     postId={post[0]}
                //     state={state}
                //     hasPaid={post.hasPaid}
                //     hasListed = {post[11]}
                //     decryptedFiles={post.decryptedFiles}
                //     ipfsHashes={post.ipfsHashes}
                // />

                <Post
                    key={post.NFTID}
                    displayName={post.username}
                    text={post.postText}
                    price={Number(post.viewPrice) / 100}
                    deletePostHandler={deletePostHandler(post.NFTID)}
                    isCreator={address === post.username}
                    postId={post.NFTID}
                    state={state}
                    hasPaid={post.hasPaid}
                    hasListed = {post.hasListed}
                    decryptedFiles={post.decryptedFiles}
                    ipfsHashes={post.ipfsHashes}
                />
            ))}

        </>
    );
}

export default Home;

