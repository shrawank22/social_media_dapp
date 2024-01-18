import { useState } from "react";
import "./PostContainer.css";
import axios from "axios";


function PostContainer({ state }) {
    const { contract, address, signer, provider } = state;

    const [postText, setPostText] = useState('');
    const [isPaid, setIsPaid] = useState('');
    const [viewPrice, setViewPrice] = useState('');
    const [formKey, setFormKey] = useState(0);

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

                try {
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", content, {
                        headers: {
                            pinata_api_key: "b895eaa0c01051beab70",
                            pinata_secret_api_key: "41fc26eb82d75c1893429a0cdb79afcb20dcc224d3f26ee7eeaff872c5373ffb"
                        }
                    });
                    console.log(res.data.IpfsHash);
                    const ipfsHash = res.data.IpfsHash;
                    await contract.addPost(String(ipfsHash), isPaid, parseInt(content.viewPrice));
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
        <form onSubmit={(e) => addPostHandler(e)}>
            <div className="row">
                <div className="col-md-9">
                    <textarea
                        onChange={updatePostText}
                        placeholder="What's happening?"
                        required
                    />
                </div>

                <div className="col-md-3">
                    <div className="row">
                        <div className="col-sm-6">
                            <select className="form-control" onChange={updateIsPaid} required>
                                <option value="">Paid?</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div className="col-sm-6">
                            <input
                                onChange={updateViewPrice}
                                type="number"
                                min={0}
                                className="form-control"
                                placeholder="Price"
                                required
                                value={viewPrice}
                                disabled={!isPaid} // Enable when isPaid is true
                            />
                        </div>

                        <div className="col-sm-12">Some Info Regarding view price and all</div>
                    </div>
                </div>
            </div>
            <button className="btn btn-primary btn-lg mt-2" type="submit">Post</button>
        </form>
    );
}

export default PostContainer;