import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { issueCredential } from "../api/credentialApi";
import { Loader } from "./Loader";
import TextInput from "./input";
import { QRCode } from "./QRCode";
// import { EthereumContext } from "../context/EthereumContext";
import web3Context from "../context/web3/web3Context";

const Register = () => {
  const context = useContext(web3Context);
  const { state } = context;
  const { address, contract } = state;

  const [name, setName] = useState("");
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loader, setLoader] = useState(false);
  const [qrcode, setQrcode] = useState("");

  let navigateTo = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("userDid")) {
      navigateTo("/connection");
    }
  });

  console.log("contract : ", contract);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    setError("");
    setSuccess("");

    const data = {
      data: JSON.stringify({
        name,
        gender,
        aadhaarNo,
        dob: new Date(dob).toLocaleDateString("en-GB").replace(/\//g, "-"),
        city,
      }),
      id: localStorage.getItem("userDid"),
    };

    try {
      const res = await issueCredential({
        userDetails: data,
        userAddress: address,
      });

      if (res.data) {
        setLoader(false);
        setSuccess("Scan using Polygon Wallet to get Credentials!!!");
        console.log("res.data : ", res.data);

        try {
          console.log("contract : ", contract);

          const tx = await contract.methods
            .registerUser(name, "https://via.placeholder.com/50")
            .send({
              from: address,
              gasPrice: "30000000000",
            });
          console.log("tx : ", tx);
        } catch (e) {
          console.log("Error adding user to blockchain : ", e);
        }

        setQrcode(JSON.stringify(res.data));
        console.log(qrcode);
      }
    } catch (err) {
      console.log("Error in creating profile : ", err);
      setLoader(false);
      if (err.code === "ECONNABORTED") {
        setError("Error in creating profile!!!");
        return;
      }
      if (err.response?.data?.message) {
        setError(err.response?.data?.message);
      } else {
        setError("Something went wrong!!! Retry...");
      }
    }
  };

  const redoConnection = () => {
    localStorage.clear();
    navigateTo("/connection");
  };

  return (
    <>
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

                  <p
                    onClick={redoConnection}
                    className="text-center cursor-pointer text-sm font-medium"
                  >
                    Redo Connection
                  </p>
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
