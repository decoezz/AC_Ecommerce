import React from "react";
import { Link } from "react-router-dom";
import styles from "./AdminHome.module.css";

const AdminHome = () => {
    return (
        <div className={styles.adminHome}>
            <h2 className={styles.adminHome__title}>Admin Dashboard</h2>
            <div className={styles.adminHome__content}>
                <h2>Welcome, Admin!</h2>
                <p>Manage your application effectively:</p>
                <ul className={styles.adminHome__links}>
                    <li><Link to="/manage-products">Manage Products</Link></li>
                    <li><Link to="/view-orders">View All Orders</Link></li>
                    <li><Link to="/users">View All Users</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default AdminHome; 