import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingBag,
  FaBoxOpen,
  FaChartLine,
  FaClipboardList,
  FaRegClock,
  FaSpinner,
} from "react-icons/fa";
import styles from "./EmployeeHome.module.css";

const EmployeeHome = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    // If no token or user, or if user is not an admin or employee, redirect to not found
    if (
      !token ||
      !userData ||
      (userData.role !== "Admin" && userData.role !== "Employee")
    ) {
      navigate("/not-found");
      return;
    }

    setUser(userData);

    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <FaSpinner className={styles.loadingSpinner} />
          <h2>Loading Dashboard</h2>
          <div className={styles.loadingBar}>
            <div className={styles.loadingBarFill}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.employeeHome}>
      <div className={styles.employeeHome__header}>
        <div className={styles.headerLeft}>
          <h2>Welcome, {user?.name || "User"}</h2>
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
