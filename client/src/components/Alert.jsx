import { useContext } from 'react'
import web3Context from '../context/web3/web3Context';


export default function Alert() {
    const context = useContext(web3Context);
    const { alert } = context;


    return (
        <>
            {alert && <div className={`container my-2 alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                {alert.msg}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>}
        </>
    )
}
