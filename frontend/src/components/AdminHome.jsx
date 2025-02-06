import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaProductHunt,
  FaListAlt,
  FaUsers,
  FaUserPlus,
  FaSearch,
  FaTrash,
  FaChartLine,
  FaSpinner,
  FaUserCog,
} from "react-icons/fa";
import axios from "axios";
import styles from "./AdminHome.module.css";

const AdminHome = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const adminCards = [
    {
      to: "/manage-products",
      icon: <FaProductHunt />,
      title: "Manage Products",
      description: "View, add, edit, or remove products from your inventory.",
      delay: 1,
    },
    {
      to: "/view-orders",
      icon: <FaListAlt />,
      title: "Order Management",
      description: "Track and manage all customer orders and their status.",
      delay: 2,
    },
    {
      to: "/user-management",
      icon: <FaUserCog />,
      title: "User Management",
      description:
        "Comprehensive user control: View all users, create employee accounts, search and manage user profiles.",
      delay: 3,
      highlight: true,
    },
  ];

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
    <div className={styles.adminHome}>
      <div className={styles.adminHome__header}>
        <h2 className={`${styles.adminHome__title} ${styles.slideIn}`}>
          Admin Dashboard
        </h2>
        <div className={`${styles.welcomeMessage} ${styles.fadeIn}`}>
          <h3>Welcome, Admin!</h3>
          <p>Manage your application effectively</p>
        </div>
      </div>

      <div className={`${styles.adminHome__content} ${styles.fadeIn}`}>
        <div className={styles.adminHome__links}>
          {adminCards.map((card, index) => (
            <Link
              to={card.to}
              className={`${styles.adminHome__card} ${styles.slideInUp} ${
                card.highlight ? styles.highlightCard : ""
              }`}
              style={{ "--delay": `${card.delay * 0.1}s` }}
              key={index}
            >
              <div className={styles.adminHome__iconWrapper}>
                <div className={styles.adminHome__icon}>{card.icon}</div>
                <div className={styles.iconRipple}></div>
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {card.highlight && (
                <div className={styles.featuresList}>
                  <span>• View All Users</span>
                  <span>• Create Employee Accounts</span>
                  <span>• Search Users</span>
                  <span>• Manage User Access</span>
                </div>
              )}
              <div className={styles.cardOverlay}></div>
            </Link>
          ))}
        </div>

        <div className={`${styles.graphContainer} ${styles.slideInUp}`}>
          <div className={styles.graphHeader}>
            <h3>
              <FaChartLine className={styles.graphIcon} />
              Analytics Overview
            </h3>
          </div>
          <div className={styles.graphPlaceholder}>
            <div className={styles.graphAnimation}>
              <div className={styles.graphLine}></div>
              <div className={styles.graphDot}></div>
            </div>
            <p>Interactive analytics coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
