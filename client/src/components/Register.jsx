import { useState } from 'react'

const Register = ({ state }) => {
    const [address, setAddress] = useState("");
    const handleLogin = () => {
        setAddress(state.address)
    }
    return (
        <>
            <h1>Register Page</h1>
            <form>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">User Wallet</label>
                    <div className="input-group">
                        <input id="username" name='username' type="text" className="form-control" disabled readOnly placeholder="Eth Address" value={address} />
                        <button className="btn btn-outline-secondary" type="button" onClick={handleLogin} >
                            <i className="bi bi-wallet"></i>
                        </button>
                    </div>

                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" />
                </div>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Password</label>
                    <input type="text" className="form-control" id="name" name='name' />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Name</label>
                    <input type="password" className="form-control" id="password" name='password' />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>

        </>
    )
}

export default Register
