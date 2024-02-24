import PostContext from "./postContext";
import { useState } from "react";
import axios from 'axios'

const PostState = ({ children }) => {
    const host = "http://localhost:8080"


    const [alert, setAlert] = useState(null);

    const showAlert = (type, message) => {
        setAlert({
            type: type,
            msg: message
        });
        setTimeout(() => {
            setAlert(null);
        }, 1500);
    };

    const getPost = async (id) => {
        try {
            const res = await axios.get(`${host}/api/posts/${id}`);
            return res.data;
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error fetching posts")
        }
    }

    const deletePost = async (id) => {
        try {
            const res = await axios.delete(`${host}/api/posts/${id}`);
            return res.data;
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error deleting post")
            return error;
        }
    }

    const postPost = async (post) => {
        try {
            const res = await axios.post(`${host}/api/posts`, post, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return res.data;
        } catch (error) {
            console.log(error);
            showAlert("danger", "Error posting post")
            return error;
        }
    }



    return (
        <PostContext.Provider value={{ alert, showAlert, getPost, deletePost, postPost }}>
            {children}
        </PostContext.Provider>
    )

}
export default PostState;