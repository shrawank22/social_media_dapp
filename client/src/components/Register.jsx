import { useState, useContext } from "react"
import { useNavigate } from 'react-router'
import axios from 'axios'
import postContext from '../context/post/postContext';
import web3Context from '../context/web3/web3Context';

const Register = () => {
    const context1 = useContext(postContext);
    const context2 = useContext(web3Context);
    const { showAlert } = context1;
    const { state } = context2;


    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const handleWallet = () => {
        setUsername(state.address)
    }

    let navigateTo = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
            const response = await axios.post("http://localhost:8080/api/register", { username, password, name, email }, {
                withCredentials: "true",
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            console.log(response.data)

            localStorage.setItem('token', response.data.authtoken);
            navigateTo("/");
            showAlert("success", `Welcome ${response.data.user.username}!`)


        } catch (err) {
            showAlert("danger", err.message)
            console.log(err);
           
        }
    }

    const onChange1 = (e) => {
        setPassword(e.target.value)
    }
    const onChange2 = (e) => {
        setName(e.target.value)
    }
    const onChange3 = (e) => {
        setEmail(e.target.value)
    }
    return (
        <>
            <h1>Register Page</h1>
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
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>

        </>
    )
}

export default Register
