import web3Context from '../context/web3/web3Context';
import postContext from '../context/post/postContext';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';

const PostHelper = ({ displayName, text, price, decryptedFiles, ipfsHashes }) => {
    const context1 = useContext(postContext);
    const context2 = useContext(web3Context);
    const { showAlert } = context1;
    const { state } = context2;
    const { contract, address } = state;

    const [isFollowing, setIsFollowing] = useState(false);

    const handleFollowClick = async () => {
        try {
            const token = localStorage.getItem('token'); 
            // console.log(token)
            if (!isFollowing) {
                await contract.followUser(displayName);

                const response = await axios.post(`http://localhost:8080/api/follow/${displayName}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                console.log(response.data)
        
            } else {
                await contract.unfollowUser(displayName);
                const response = await axios.post(`http://localhost:8080/api/unfollow/${displayName}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                console.log(response.data)
            }
        } catch (err) {
            showAlert('danger', err.reason);
            console.error(err);
        }

    };

    useEffect(() => {
        const checkFollowingStatus = async () => {
            const followingStatus = await contract.followers(address, displayName);
            setIsFollowing(followingStatus);
        };

        checkFollowingStatus();
    }, [contract, address, displayName]);

    return (
        <div className="post-helper-container">
            <div className="d-flex justify-content-start">
                <div style={{ marginRight: "5px" }}>
                    <img src="https://images.unsplash.com/photo-1707159432991-ac67eace0014?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="dp" className="rounded-circle" style={{ width: "50px", height: "50px" }} />
                </div>
                <div>
                    <div className="m-2" style={{ fontSize: "15px" }}>
                        <span className="fw-bold">{displayName}</span>
                        <span className="text-secondary"> 49m  ·</span>
                        <a className={`${isFollowing ? 'text-danger' : 'text-success'} fw-bold`} onClick={handleFollowClick}>{isFollowing ? ' Unfollow' : ' Follow'}</a>
                    </div>

                    <div className="post_description">
                        <p>{text}</p>
                    </div>

                    <div className="media-container">
                        {decryptedFiles && decryptedFiles.map((src) => (
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
                </div>
            </div>

            <div className="price-container">
                <button className='btn btn-info btn-sm'>View Price <span className="badge text-bg-secondary">{price}</span></button>
            </div>
        </div>
    )
};

export default PostHelper;
