import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./UserOrders.module.css";

const UserOrders = () => {
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.get(`${baseURL}/orders/${userId}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch user orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.userOrders}>
      <h2>Search User Orders</h2>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.results}>
          {userDetails && (
            <div className={styles.userInfo}>
              <h3>User Details</h3>
              <p>
                <strong>Name:</strong> {userDetails.name}
              </p>
              <p>
                <strong>Email:</strong> {userDetails.email}
              </p>
              <p>
                <strong>Mobile:</strong> {userDetails.mobileNumber}
              </p>
            </div>
          )}

          {orders.length > 0 ? (
            <div className={styles.ordersSection}>
              <h3>Orders History</h3>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={styles[order.status || "pending"]}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td>${(order.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        <Link
                          to={`/orders/details/${order._id}`}
                          className={styles.viewButton}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            userId && !loading && <p>No orders found for this user.</p>
          )}
        </div>
      )}

      <Link to="/orders" className={styles.backButton}>
        Back to Orders
      </Link>
    </div>
  );
};

export default UserOrders;
