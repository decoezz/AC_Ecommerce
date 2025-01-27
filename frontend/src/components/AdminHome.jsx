import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./AdminHome.module.css";
import { FaProductHunt, FaListAlt, FaUsers } from 'react-icons/fa';

const AdminHome = () => {
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/admin/signup`, {
                name,
                mobileNumber,
                email,
                password,
                passwordConfirm,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage('Employee account created successfully!');
            // Clear the form fields
            setName('');
            setMobileNumber('');
            setEmail('');
            setPassword('');
            setPasswordConfirm('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create employee account.');
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
                        <h3>View All Orders</h3>
                        <p>Check the status of all customer orders.</p>
                    </Link>
                    <Link to="/users" className={styles.adminHome__card}>
                        <FaUsers className={styles.adminHome__icon} />
                        <h3>View All Users</h3>
                        <p>Manage user accounts and permissions.</p>
                    </Link>
                    <Link to="/create-employee" className={styles.adminHome__card}>
                        <h3>Create Employee Account</h3>
                        <p>Add new employee accounts.</p>
                    </Link>
                </div>

                
            </div>
        </div>
    );
};

export default AdminHome; 