import React, { useState } from 'react';
import axios from 'axios';
import styles from './ViewOrders.module.css';

const ViewOrders = () => {
    const [userId, setUserId] = useState('');
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    const fetchOrders = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }
        setLoading(true); // Start loading
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrders(response.data.data);
            setError(''); // Clear any previous errors
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders.');
            setOrders([]); // Clear orders on error
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (userId) {
            fetchOrders(userId); // Fetch orders for the entered user ID
        } else {
            setError('Please enter a user ID.');
        }
    };

    return (
        <div className={styles.viewOrders}>
            <h2>User Orders</h2>
            <form onSubmit={handleSubmit} className={styles.orderForm}>
                <input
                    type="text"
                    placeholder="Enter User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className={styles.userIdInput}
                />
                <button type="submit" className={styles.submitButton}>Fetch Orders</button>
            </form>
            {loading && <p className={styles.loading}>Loading...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {orders.length > 0 && (
                <table className={styles.orderTable}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.status}</td>
                                <td>{new Date(order.date).toLocaleDateString()}</td>
                                <td>${order.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ViewOrders; 