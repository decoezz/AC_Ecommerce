import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSpinner,
  FaCheck,
  FaTimes,
  FaEdit,
  FaShoppingBag,
} from "react-icons/fa";
import styles from "./OrderManagement.module.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);

  const orderStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/admin`,
        {
          orderStatus: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Update the local state with the new status
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );
        setMessage("Order status updated successfully");
      } else {
        throw new Error(
          response.data.message || "Failed to update order status"
        );
      }

      setEditingOrder(null);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.response?.data?.message || "Failed to update order status");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "#f59e0b",
      Processing: "#3b82f6",
      Shipped: "#8b5cf6",
      Delivered: "#10b981",
      Cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <div className={styles.orderManagement}>
      <div className={styles.header}>
        <h2>Order Management</h2>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <FaSpinner className={styles.spinner} />
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchOrders}>Retry</button>
        </div>
      ) : (
        <div className={styles.ordersTable}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user?.name || "N/A"}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>${order.totalAmount}</td>
                  <td>
                    {editingOrder === order._id ? (
                      <select
                        value={order.orderStatus}
                        onChange={(e) => {
                          e.preventDefault();
                          handleStatusUpdate(order._id, e.target.value);
                        }}
                        className={styles.statusSelect}
                        style={{
                          borderColor: getStatusColor(order.orderStatus),
                        }}
                        disabled={isLoading}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: getStatusColor(order.orderStatus),
                        }}
                      >
                        {order.orderStatus}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() =>
                        setEditingOrder(
                          editingOrder === order._id ? null : order._id
                        )
                      }
                    >
                      {editingOrder === order._id ? <FaTimes /> : <FaEdit />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <div className={styles.message}>
          <p>{message}</p>
          <button onClick={() => setMessage("")}>
            <FaCheck />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
