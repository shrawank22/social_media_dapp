import { useState, useEffect } from 'react';
import axios from 'axios';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const response = await axios.get('http://localhost:8080/api/notifications', {
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
    }, []);

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
