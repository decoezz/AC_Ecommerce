import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaProductHunt, FaListAlt, FaUsers } from 'react-icons/fa';
import styles from "./AdminHome.module.css";

const AdminHome = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token
        navigate('/login'); // Redirect to login page
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
                    <Link to="/search-user" className={styles.adminHome__card}>
                        <h3>Search User by ID</h3>
                        <p>Find user details by their ID.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminHome; 