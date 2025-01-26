import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './UserProfile.module.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch user data.');
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/'; // Redirect to login
    };

    return (
        <div className={styles.userProfile}>
            <h2>User Profile</h2>
            {error && <p className={styles.error}>{error}</p>}
            {user ? (
                <div>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>Mobile Number: {user.mobileNumber}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default UserProfile; 