import React from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingBag,
  FaBoxOpen,
  FaChartLine,
  FaClipboardList,
  FaRegClock,
} from "react-icons/fa";
import styles from "./EmployeeHome.module.css";

const EmployeeHome = () => {
  return (
    <div className={styles.employeeHome}>
      <div className={styles.employeeHome__header}>
        <div className={styles.headerLeft}>
          <h2>Employee Dashboard</h2>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.dateTime}>
            <FaRegClock />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.employeeHome__content}>
        <div className={styles.actionCards}>
          <Link to="/view-orders" className={styles.actionCard}>
            <FaShoppingBag className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <h3>Process Orders</h3>
              <p>View and manage customer orders</p>
            </div>
          </Link>
          <Link to="/manage-products" className={styles.actionCard}>
            <FaBoxOpen className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <h3>Inventory Management</h3>
              <p>Update product information and stock</p>
            </div>
          </Link>
          <Link to="/sales-reports" className={styles.actionCard}>
            <FaChartLine className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <h3>Performance Metrics</h3>
              <p>Track your daily performance</p>
            </div>
          </Link>
          <Link to="/tasks" className={styles.actionCard}>
            <FaClipboardList className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <h3>Task Management</h3>
              <p>View and complete assigned tasks</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;
