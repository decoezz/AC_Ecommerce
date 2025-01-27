import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaProductHunt, FaListAlt, FaUsers, FaUserPlus, FaSearch, FaTrash } from 'react-icons/fa';
import axios from "axios";
import styles from "./AdminHome.module.css";

const AdminHome = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token
        navigate('/login'); // Redirect to login page
    };

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
        <div className={styles.adminHome}>
            <h2 className={styles.adminHome__title}>Admin Dashboard</h2>
            <div className={styles.adminHome__content}>
                <h2>Welcome, Admin!</h2>
                <p>Manage your application effectively:</p>
                <div className={styles.adminHome__links}>
                    <Link to="/manage-products" className={styles.adminHome__card}>
                        <FaProductHunt className={styles.adminHome__icon} />
                        <h3>Manage Products</h3>
                        <p>View, add, or edit products in your inventory.</p>
                    </Link>
                    <Link to="/view-orders" className={styles.adminHome__card}>
                        <FaListAlt className={styles.adminHome__icon} />
                        <h3>Order Management</h3>
                        <p>Check the status of all customer orders.</p>
                    </Link>
                    <Link to="/users" className={styles.adminHome__card}>
                        <FaUsers className={styles.adminHome__icon} />
                        <h3>View All Users</h3>
                        <p>Manage user accounts and permissions.</p>
                    </Link>
                    <Link to="/create-employee" className={styles.adminHome__card}>
                        <FaUserPlus className={styles.adminHome__icon} />
                        <h3>Create Employee Account</h3>
                        <p>Add new employee accounts.</p>
                    </Link>
                    <Link to="/search-user" className={styles.adminHome__card}>
                        <FaSearch className={styles.adminHome__icon} />
                        <h3>Search User by ID</h3>
                        <p>Find user details by their ID.</p>
                    </Link>
                    <Link to="/delete-user" className={styles.adminHome__card}>
                        <FaTrash className={styles.adminHome__icon} />
                        <h3>Delete User by ID</h3>
                        <p>Remove a user from the system.</p>
                    </Link>
                </div>
                <div className={styles.graphContainer}>
                    <h3>Graphs and Analytics</h3>
                    <div className={styles.graphPlaceholder}>
                        {/* Placeholder for future graphs */}
                        <p>Graph area (to be implemented)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome; 