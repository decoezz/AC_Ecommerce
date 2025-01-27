import React, { useState } from "react";
import axios from "axios";
import styles from "./SearchUser.module.css";

const SearchUser = () => {
    const [userId, setUserId] = useState('');
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');

    const handleSearchUser = async () => {
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserData(response.data.data); // Assuming the user data is in response.data.data
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('User not found.');
            } else {
                setError(err.response?.data?.message || 'Failed to fetch user data.');
            }
            setUserData(null); // Clear previous user data
        }
    };

    return (
        <div className={styles.searchUser}>
            <h2>Search User by ID</h2>
            <div className={styles.searchInputContainer}>
                <input
                    type="text"
                    placeholder="Enter User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className={styles.searchInput}
                />
                <button onClick={handleSearchUser} className={styles.searchButton}>Search</button>
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {userData && (
                <div className={styles.userData}>
                    <h4>User Details</h4>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Mobile Number:</strong> {userData.mobileNumber}</p>
                    <p><strong>Role:</strong> {userData.role}</p>
                    <p><strong>Address:</strong> {userData.address}</p>
                    <p><strong>Created At:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
                </div>
            )}
        </div>
    );
};

export default SearchUser; 