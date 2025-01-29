import React, { useState } from "react";
import axios from "axios";
import styles from "./SearchOrders.module.css";

const SearchOrders = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setOrders([]);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to search orders");
      }

      const apiUrl = `http://127.0.0.1:4000/api/v1/orders/user/${mobileNumber}`;
      console.log("Requesting URL:", apiUrl);

      const response = await axios({
        method: "GET",
        url: apiUrl,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data.data?.order) {
        setOrders([response.data.data.order]);
      } else {
        setMessage("No orders found for this mobile number");
      }
    } catch (err) {
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchOrders}>
      <h2>Search Orders by Mobile Number</h2>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.inputGroup}>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter mobile number"
            required
            className={styles.input}
          />
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={styles.message}>{message}</div>}

      {orders.length > 0 && (
        <div className={styles.results}>
          <h3>Found Orders</h3>
          <div className={styles.ordersGrid}>
            {orders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span>Order ID: {order._id}</span>
                  <span className={styles.status}>
                    Status: {order.orderStatus}
                  </span>
                </div>
                <div className={styles.orderDetails}>
                  <p>Shipping Address: {order.shippingAddress}</p>
                  <p>Mobile: {order.mobileNumber}</p>
                  <p>Total Amount: ${order.totalAmount}</p>
                  <p>Items: {order.items.length}</p>
                  <p>Created: {new Date(order.purchasedAt).toLocaleString()}</p>
                </div>
                <div className={styles.itemsList}>
                  {order.items.map((item) => (
                    <div key={item._id} className={styles.item}>
                      <p>Item ID: {item.ac}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.priceAtPurchase}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchOrders;
