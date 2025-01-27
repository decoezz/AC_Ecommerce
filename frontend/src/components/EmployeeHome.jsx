import React from "react";
import { Link } from "react-router-dom";
import styles from "./EmployeeHome.module.css";

const EmployeeHome = () => {
    return (
        <div className={styles.employeeHome}>
            <h2 className={styles.employeeHome__title}>Employee Dashboard</h2>
            <div className={styles.employeeHome__content}>
                <h2>Welcome, Employee!</h2>
                <p>Here are your tasks:</p>
                <ul className={styles.employeeHome__links}>
                    <li><Link to="/view-orders">View Your Orders</Link></li>
                    <li><Link to="/manage-products">Manage Products</Link></li>
                </ul>
                <h3>Available Actions:</h3>
                <ul className={styles.employeeHome__actions}>
                    <li>✔ View and process orders</li>
                    <li>✔ Update product information</li>
                </ul>
            </div>
        </div>
    );
};

export default EmployeeHome; 