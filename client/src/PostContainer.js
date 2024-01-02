import { useState , useEffect } from "react";
import "./PostContainer.css";
import { Button } from "@material-ui/core";
import {Web3} from 'web3'
import SocialMediaContract from './blockchain/SocialMediaContract'
import axios from "axios";


function PostContainer() {
    const [, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [socialContract, setSocialContract] = useState(null)

  
    const [postText, setPostText] = useState('');
    const [isPaid, setIsPaid] = useState('');
    const [viewPrice, setViewPrice] = useState('');
    const [formKey, setFormKey] = useState(0);

    useEffect(() => {
        connectWalletHandler();
    }, [address]);
    
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
            } catch(err) {
                console.log(err);
            }
        } else {
            console.log("Please install MetaMask")
        }
    }
    
    const updatePostText = event => {
        setPostText(event.target.value)
    }
    
    const updateIsPaid = event => {
        setIsPaid(event.target.value === 'Yes'); 
    }

    const updateViewPrice = event => {
        const value = event.target.value;
        // Allow only numbers and floating point input
        if (!isNaN(value) && value.match(/^(\d+)?([.]?\d+)?$/)) {
            setViewPrice(value);
        }
    }
    
    const addPostHandler = async (event) => {
        event.preventDefault(); 
        try {
            console.log("Trying to add a post");
            if (postText === '' || isPaid === '' || viewPrice === '') {
                console.log("Input fields can't be empty")
            } else {
                const content = {
                    text: postText,
                    isPaid: isPaid,
                    viewPrice: parseFloat(viewPrice) * 100
                };
                // console.log(process.env.REACT_APP_API_Key)
    
                try{
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", content, {
                        headers: {
                            pinata_api_key: "b895eaa0c01051beab70",
                            pinata_secret_api_key: "41fc26eb82d75c1893429a0cdb79afcb20dcc224d3f26ee7eeaff872c5373ffb"
                        }
                    });
                    console.log(res.data.IpfsHash);
                    const ipfsHash = res.data.IpfsHash;
                    await socialContract.methods.addPost(String(ipfsHash), isPaid, parseInt(content.viewPrice)).send({
                        from: address,
                        gas: 3000000,
                        gasPrice: null
                    });

                    // resetting inputs
                    setPostText('');
                    setIsPaid('');
                    setViewPrice('');

                    setFormKey(formKey + 1);

                } catch (error) {
                    console.log(error);
                }
            }

            
        } catch (err) {
            console.log(err.message)
        }
    }

    return (
        <div className="postContainer">
            <form key={formKey}>
                <div className="content">
                    <div className="customAvatar">
                        <img
                            src="https://qph.cf2.quoracdn.net/main-thumb-401012302-200-qjrtpkfzscqeqnoirkesayialmrsiejk.jpeg"
                            alt="Custom Avatar"
                            style={{ width: '100px', height: '100px', marginRight: '10px', borderRadius: '50%' }}
                        />
                    </div>
                   
                    <textarea
                        onChange={updatePostText}
                        placeholder="What's happening?"
                        required
                    />
                    <div className="inputRow">
                        <select onChange={updateIsPaid} className="input" required>
                            <option value="">Paid?</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                        <input
                            onChange={updateViewPrice}
                            type="text" 
                            placeholder="View Price"
                            className="input"
                            required
                            value={viewPrice}
                            disabled={!isPaid} // Enable when isPaid is true
                        />
                    </div>
                </div>
                <Button className="postBtn" type="submit" onClick={(e) => addPostHandler(e)}>Post</Button>
            </form>
        </div>
    );
}

export default PostContainer;