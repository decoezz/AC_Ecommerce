import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ViewOrders.module.css';

const ViewOrders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/6792640012a739aa25a22cde/user`, { // Replace with actual user ID
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOrders(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch orders.');
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className={styles.viewOrders}>
            <h2>User Orders</h2>
            {error && <p className={styles.error}>{error}</p>}
            <ul>
                {orders.map((order) => (
                    <li key={order.id}>Order ID: {order.id} - Status: {order.status}</li>
                ))}
            </ul>
        </div>
    );
};

export default ViewOrders; 