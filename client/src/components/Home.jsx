import { useContext, useEffect, useState } from 'react'

import PostContainer from './PostContainer';
import Post from './Post';
import postContext from '../context/post/postContext';

import { Loader } from './Loader';
import { EthereumContext } from '../context/EthereumContext';

const Home = () => {
    const context1 = useContext(postContext);
    const context2 = useContext(EthereumContext);
    const { showAlert, deletePost, posts, setPosts, loader, setLoader, posted, followEvent } = context1;
    const { state } = context2;
    const { contract, address } = state;

    const deletePostHandler = key => async () => {
        try {
            const usersWhoPaid = await contract.methods.getPaidUsersByPostId(key).call();
            if (usersWhoPaid.length > 0) {
                showAlert("danger", "You cannot delete a post that has been paid for");
                return null;
            }

            await contract.methods.deletePost(key).send({ from: address, gasPrice: '30000000000' });
            // await receipt.wait();
            setPosts(posts.filter(post => post[0] !== key));
            deletePost(key);
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error deleting post");
            return null;
        }
    }

    // useEffect(() => {
    //     if (contract) {
    //         fetchPosts();
    //         // contract.removeAllListeners("NewPostForFollower");
    //     }
    //   }, [state, posted, contract, address, followEvent]);


    return (
        <>
            {localStorage.getItem('jwz-token') ? 
            <div className='mt-3'>
                <PostContainer />
            </div>
            :
            <>
                <div className='flex justify-center items-center'>
                    <h1 className='text-xl font-bold my-5'>Please login / register using wallet app to view posts</h1>
                </div>
            </>
            }

            {loader ? 
            <>
                <div className='flex justify-center items-center pl-48'>
                    <Loader size={20} color="gray-900" />
                </div>
            </> : posts.map((post) => (
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

