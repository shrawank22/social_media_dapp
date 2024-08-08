import { useState, useEffect, useContext } from 'react';
import { getNotifications } from '../api/notificationApi';
// import { EthereumContext } from '../context/EthereumContext';
import web3Context from '../context/web3/web3Context';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const context1 = useContext(web3Context);
    const { state } = context1;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getNotifications(state);

                console.log("response : ", response.data);

                if (response.data && response.status === 200) {
                    setNotifications(response.data);
                }
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
                {notifications.length > 0 && notifications.map(notification => (
                    <li key={notification._id}>
                        {notification.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Notification;
