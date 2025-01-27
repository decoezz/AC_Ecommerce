import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './UserProfile.module.css';
import RoleOptionsModal from './RoleOptionsModal';

const UserProfile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUserProfile = async (retries = 3, delay = 1000) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:4000/api/v1/users/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    // Wait for the specified delay before retrying
                    await new Promise(res => setTimeout(res, delay));
                    return fetchUserProfile(retries - 1, delay * 2); // Exponential backoff
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("User Data:", data); // Log the entire response
            setUserProfile(data.data.user); // Access the user object correctly
        } catch (err) {
            console.error("Fetch error:", err); // Log the error for debugging
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleProfileClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirect to login
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!userProfile) {
        return <div>No user profile data available.</div>;
    }

    return (
        <div className={styles.userProfile}>
            <h2>User Profile</h2>
            <p>Name: {userProfile.name || 'N/A'}</p>
            <p>Email: {userProfile.email || 'N/A'}</p>
            <p>Mobile Number: {userProfile.mobileNumber || 'N/A'}</p>
            <button onClick={handleProfileClick}>Profile Options</button>
            <RoleOptionsModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                role={userProfile.role} 
            />
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default UserProfile; 