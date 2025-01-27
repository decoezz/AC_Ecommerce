import React, { useState } from "react";
import axios from "axios";
import styles from "./DeleteUserPage.module.css";

const DeleteUserPage = () => {
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleDeleteUser = async () => {
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage('User deleted successfully!');
            setUserId(''); // Clear the input field
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    return (
        <div className={styles.deleteUserPage}>
            <h2 className={styles.title}>Delete User by ID</h2>
            <input
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={styles.deleteInput}
            />
            <button onClick={handleDeleteUser} className={styles.deleteButton}>Delete User</button>

            {message && <p className={styles.success}>{message}</p>}
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default DeleteUserPage; 