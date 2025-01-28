import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./SearchUserOrders.module.css";

const SearchUserOrders = () => {
  const [userId, setUserId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;

      let endpoint;
      if (userId) {
        endpoint = `${baseURL}/orders/${userId}/user`;
      } else if (mobileNumber) {
        endpoint = `${baseURL}/orders/user/${mobileNumber}`;
      } else {
        throw new Error("Please provide either User ID or Mobile Number");
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        setOrders(response.data.data);
        setUserDetails(response.data.user || null);
      } else {
        setOrders([]);
        setError("No orders found for this user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchUserOrders}>
      <h2>Search User Orders</h2>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.formGroup}>
          <label htmlFor="userId">User ID</label>
          <input
            id="userId"
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mobileNumber">Mobile Number</label>
          <input
            id="mobileNumber"
            type="tel"
            placeholder="Enter Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button type="submit" className={styles.searchButton}>
          Search User Orders
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {userDetails && (
        <div className={styles.userDetails}>
          <h3>User Information</h3>
          <p>Name: {userDetails.name || "N/A"}</p>
          <p>Mobile: {userDetails.mobileNumber || "N/A"}</p>
          <p>Total Orders: {orders.length}</p>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading user orders...</div>
      ) : (
        <div className={styles.resultsContainer}>
          {orders.length > 0 ? (
            <table className={styles.resultsTable}>
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
                    <td>${order.totalAmount?.toFixed(2) || "0.00"}</td>
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
          ) : (
            <div className={styles.noResults}>
              No orders found for this user.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUserOrders;
