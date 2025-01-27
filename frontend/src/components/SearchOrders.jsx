import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./SearchOrders.module.css";

const SearchOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError("Please enter an order ID");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.get(
        `${baseURL}/orders/GetOrders/${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders([response.data.data]); // Wrap single order in array
      setError("");
    } catch (err) {
      setError("Order not found");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchOrders}>
      <h2>Search Orders</h2>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter Order ID"
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
          {orders.length > 0 && (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
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
                    <td>{order.user?.name || "N/A"}</td>
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
          )}
        </div>
      )}

      <Link to="/orders" className={styles.backButton}>
        Back to Orders
      </Link>
    </div>
  );
};

export default SearchOrders;
