import { useState } from "react"
import { useNavigate } from 'react-router'
import axios from 'axios'

const Login = ({ state }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleWallet = () => {
        setUsername(state.address)
    }

    let navigateTo = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
            const response = await axios.post("http://localhost:8080/api/login", { username, password }, {
                withCredentials: "true",
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            // console.log(response)

            localStorage.setItem('token', response.data.authtoken);
            navigateTo("/");


        } catch (err) {
            console.log(err);
           
        }
    }

    const onChange = (e) => {
        setPassword(e.target.value)
    }


    return (
        <>
            <h1>Login Page</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">User Wallet</label>
                    <div className="input-group">
                        <input id="username" name="username" type="text" className="form-control" disabled readOnly placeholder="Eth Address" value={username} />
                        <button className="btn btn-outline-secondary" type="button" onClick={handleWallet} >
                            <i className="bi bi-wallet"></i>
                        </button>
                    </div>

                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" id="password" value={password} onChange={onChange} />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
        </>
    )
}

export default Login
