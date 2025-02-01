import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Orders.module.css";
import { FaShoppingBag, FaStore, FaSearch, FaFilter } from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;

      const response = await axios.get(`${baseURL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.mobileNumber.includes(searchTerm) || order._id.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" || order.orderStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const statusColors = {
      completed: "green",
      "on hold": "orange",
      cancelled: "red",
      processing: "blue",
    };
    return statusColors[status] || "gray";
  };

  return (
    <div className={styles.orders}>
      <div className={styles.header}>
        <h1>Orders</h1>
        <div className={styles.controls}>
          <div className={styles.search}>
            <FaSearch />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filter}>
            <FaFilter />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="on hold">On Hold</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading orders...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderIcon}>
                  {order.orderType === "store" ? (
                    <FaStore />
                  ) : (
                    <FaShoppingBag />
                  )}
                </div>
                <div className={styles.orderInfo}>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <span className={styles.date}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className={styles.customerInfo}>
                <p>
                  <strong>Mobile:</strong> {order.mobileNumber}
                </p>
                <p>
                  <strong>Address:</strong> {order.shippingAddress}
                </p>
              </div>

              <div className={styles.items}>
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
                  <span>
                    $
                    {order.items
                      .reduce(
                        (sum, item) =>
                          sum + item.quantity * item.priceAtPurchase,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
