import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import postContext from "../context/post/postContext";
import web3Context from "../context/web3/web3Context";
import { issueCredential } from "../api/credentialApi";
import { Loader } from "./Loader";
import TextInput from "./input";
import { QRCode } from "./QRCode";


const Register = () => {
    const context1 = useContext(postContext);
    const context2 = useContext(web3Context);
    const { showAlert } = context1;
    const { state } = context2;

    const [name, setName] = useState("");
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [city, setCity] = useState("");
    const [did, setDid] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loader, setLoader] = useState(false);
    const [qrcode, setQrcode] = useState("");

    // const handleWallet = () => {
    //     setUsername(state.address)
    // }

    let navigateTo = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("userDid")) {
            navigateTo("/connection");
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);
        setError("");
        setSuccess("");

        const data = {
            name,
            gender,
            aadhaarNo,
            dob: new Date(dob).toLocaleDateString("en-GB").replace(/\//g, '-'),
            city,
            id: localStorage.getItem("userDid"),
        };

        try {
            const res = await issueCredential(data);

            if (res.data) {
                setLoader(false);
                setSuccess("Scan using Polygon Wallet to get Credentials!!!");
                console.log("res.data : ", res.data);
                setQrcode(JSON.stringify(res.data));
                console.log(qrcode);
            }

            // console.log(response.data)
            // navigateTo("/");
            // showAlert("success", `Welcome ${response.data.user.username}!`)
        } catch (err) {
            console.log("Error in creating profile : ", err);
            setLoader(false);
            setError(err.response?.data?.message);
            if (err.code === "ECONNABORTED") {
                setError("Error in creating profile!!!");
            }
            // showAlert("danger", err.response.data)
            // console.log(err.response.data);
        }
    };

    // const onChange1 = (e) => {
    //     setPassword(e.target.value)
    // }
    // const onChange2 = (e) => {
    //     setName(e.target.value)
    // }
    // const onChange3 = (e) => {
    //     setEmail(e.target.value)
    // }
    return (
        <>
            {/* <h1>Register Page</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">User Wallet</label>
                    <div className="input-group">
                        <input id="username" name='username' type="text" className="form-control" disabled readOnly placeholder="Eth Address" value={username} />
                        <button className="btn btn-outline-secondary" type="button" onClick={handleWallet} >
                            <i className="bi bi-wallet"></i>
                        </button>
                    </div>

                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email"  value={email} onChange={onChange3} />
                </div>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" name='name'  value={name} onChange={onChange2} />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" name='password'  value={password} onChange={onChange1} />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form> */}

            <section className="bg-gray-50 min-h-[93vh] py-10">
                <div className="flex flex-col items-center justify-center px-6 mx-auto lg:py-0">
                    <div className="w-full p-6 bg-white rounded-lg shadow md:mt-0 sm:max-w-md sm:p-8">
                        {qrcode.length ? (
                            <>
                                <h2 className="mb-1 text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                    Download Profile
                                </h2>

                                <h4 className="mb-5 text-sm text-center font-medium leading-tight tracking-tight text-gray-600 md:text-base">
                                    Scan QR Code using Polygon Wallet to get credentials in Wallet
                                </h4>

                                <div className="flex justify-center items-center">
                                    <QRCode invitationUrl={qrcode} />
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="mb-1 text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                    Create Profile
                                </h2>

                                <h4 className="mb-5 text-sm text-center font-medium leading-tight tracking-tight text-gray-600 md:text-base">
                                    Please fill the form below to register your profile.
                                </h4>

                                <form
                                    className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
                                    onSubmit={(e) => handleSubmit(e)}
                                >
                                    <TextInput
                                        label="Aadhaar Number"
                                        name="aadhaarNo"
                                        placeholder="Aadhaar Number"
                                        value={aadhaarNo}
                                        onChange={setAadhaarNo}
                                    />

                                    <TextInput
                                        label="Name"
                                        name="name"
                                        placeholder="Name"
                                        value={name}
                                        onChange={setName}
                                    />

                                    <TextInput
                                        label="Date of Birth"
                                        type="date"
                                        name="dob"
                                        placeholder="Date of birth"
                                        value={dob}
                                        onChange={setDob}
                                    />

                                    <div>
                                        <label
                                            htmlFor="gender"
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                        >
                                            Gender
                                        </label>
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            id="gender"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            required
                                        >
                                            <option value="" disabled selected>
                                                Choose your gender
                                            </option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                    </div>

                                    <TextInput
                                        label="City"
                                        name="city"
                                        placeholder="City"
                                        value={city}
                                        onChange={setCity}
                                    />

                                    {error ? (
                                        <div className="text-red-500 text-sm text-center">
                                            {error}
                                        </div>
                                    ) : null}
                                    {success ? (
                                        <div className="text-green-500 text-sm text-center">
                                            {success}
                                        </div>
                                    ) : null}

                                    <button
                                        type="submit"
                                        className="w-full text-white bg-indigo-600 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium text-sm rounded-lg px-5 py-2.5 text-center"
                                    >
                                        {loader ? <Loader size={8} /> : "Register"}
                                    </button>

                                    <p>Redo Connection</p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Register;
