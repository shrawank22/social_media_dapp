import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [sessionId, setSessionId] = useState();

    const publicServerURL = import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_PUBLIC_URL;
    const localServerURL = import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_LOCAL_HOST_URL;
    const serverUrl = window.location.href.startsWith("https")
    ? publicServerURL
    : localServerURL;
    console.log("serverUrl : ", serverUrl);
    const socket = io(serverUrl);

    useEffect(() => {
        console.log("useEffect 1")
        socket.on("connect", () => {
            setSessionId(socket.id);
            console.log('socket.id : ', socket.id);
            socket.on(socket.id, (arg) => {
                setSocketEvents((socketEvents) => [...socketEvents, arg]);
            });
        });
    }, []);


    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('jwz-token'); 
                console.log("sessionId : ", sessionId);

                if(!sessionId) {
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/notifications?sessionId=${sessionId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [sessionId]);

    return (
        <div>
            <h2>Notifications</h2>
            <ul>
                {notifications.map(notification => (
                    <li key={notification._id}>
                        {notification.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Notification;
