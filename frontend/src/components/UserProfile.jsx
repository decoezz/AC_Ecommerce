import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './UserProfile.module.css';
import RoleOptionsModal from './RoleOptionsModal';

const UserProfile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [message, setMessage] = useState('');

    const fetchUserProfile = async (retries = 3, delay = 1000) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect to login if no token is found
                window.location.href = '/login'; // Adjust the path to your login page
                return;
            }

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

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        const formData = new FormData();
        formData.append('profilePicture', profilePicture);

        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/upload-photo`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Profile picture uploaded successfully!');
            setProfilePicture(null); // Clear the file input
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload profile picture.');
        }
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
            <form onSubmit={handleUpload} className={styles.uploadForm}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                />
                <button type="submit">Upload Profile Picture</button>
            </form>
            {message && <p className={styles.success}>{message}</p>}
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default UserProfile; 
