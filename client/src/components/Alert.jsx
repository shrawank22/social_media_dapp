// import {useContext} from 'react'
// import todoContext from '../context/todos/todoContext';


export default function Alert({alert}) {
    // const context = useContext(todoContext);
    // const { alert } = context;


    return (
        <div style={{ height: "50px" }} >
            { alert && <div className={`alert alert-${alert.type} alert-dismissible fade show container my-2`} role="alert">
                {alert.msg}
            </div> }
        </div>
    )
}
