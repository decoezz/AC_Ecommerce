import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./ManageOrders.module.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.get(`${baseURL}/orders/GetOrders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let filteredOrders = response.data.data || [];
      if (filterStatus !== "all") {
        filteredOrders = filteredOrders.filter(
          (order) => order.status === filterStatus
        );
      }

      setOrders(filteredOrders);
      setError("");
    } catch (err) {
      setError("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      await axios.patch(
        `${baseURL}/orders/${orderId}/admin`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchOrders();
    } catch (err) {
      setError("Failed to update order status");
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      await axios.delete(`${baseURL}/orders/${orderId}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchOrders();
    } catch (err) {
      setError("Failed to delete order");
    }
  };

  return (
    <div className={styles.manageOrders}>
      <h2>Manage Orders</h2>

      <div className={styles.filters}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.statusFilter}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
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
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className={styles[order.status || "pending"]}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>${(order.totalAmount || 0).toFixed(2)}</td>
                <td className={styles.actions}>
                  <Link
                    to={`/orders/details/${order._id}`}
                    className={styles.viewButton}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(order._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to="/orders" className={styles.backButton}>
        Back to Orders
      </Link>
    </div>
  );
};

export default ManageOrders;
