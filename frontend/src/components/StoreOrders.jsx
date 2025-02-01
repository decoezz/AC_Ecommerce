import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./StoreOrders.module.css";
import { FaStore, FaSearch, FaFilter, FaCalendar } from "react-icons/fa";
import { motion } from "framer-motion";

const StoreOrders = () => {
  const [storeOrders, setStoreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchStoreOrders();
  }, [dateFilter, statusFilter]);

  const fetchStoreOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const baseURL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";

      const response = await axios.get(`${baseURL}/orders/SoldInShop`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setStoreOrders(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching store orders:", err);
      setError(err.response?.data?.message || "Failed to fetch store orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = storeOrders.filter((order) => {
    const matchesSearch =
      order.mobileNumber.includes(searchTerm) ||
      order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      !dateFilter ||
      new Date(order.createdAt).toLocaleDateString() ===
        new Date(dateFilter).toLocaleDateString();

    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const calculateTotal = (items) => {
    return items.reduce(
      (total, item) => total + item.quantity * item.priceAtPurchase,
      0
    );
  };

  return (
    <div className={styles.storeOrders}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>
            <FaStore /> Store Sales
          </h1>
          <p>Manage and view in-store orders</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search by mobile or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <FaCalendar />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading store orders...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              className={styles.orderCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.orderHeader}>
                <span className={styles.orderNumber}>
                  Order #{order._id.slice(-6)}
                </span>
                <span
                  className={`${styles.status} ${styles[order.orderStatus]}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.detail}>
                  <strong>Date:</strong>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.detail}>
                  <strong>Mobile:</strong>
                  <span>{order.mobileNumber}</span>
                </div>
                <div className={styles.detail}>
                  <strong>Address:</strong>
                  <span>{order.shippingAddress}</span>
                </div>
              </div>

              <div className={styles.items}>
                <h4>Items</h4>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.item}>
                    <span>
                      {item.ac.brand} - {item.ac.modelNumber}
                    </span>
                    <span>
                      {item.quantity} × ${item.priceAtPurchase}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.total}>
                  <strong>Total:</strong>
                  <span>${calculateTotal(order.items).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreOrders;
