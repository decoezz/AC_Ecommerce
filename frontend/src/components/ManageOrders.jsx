import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./ManageOrders.module.css";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [searchMobile, setSearchMobile] = useState("");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseURL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";

      let endpoint;
      switch (filter) {
        case "today":
          endpoint = `${baseURL}/orders/today`;
          break;
        case "week":
          endpoint = `${baseURL}/orders/last-week`;
          break;
        case "month":
          endpoint = `${baseURL}/orders/last-month`;
          break;
        default:
          endpoint = `${baseURL}/orders/GetOrders`;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data.data || []);
      setError("");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    console.error("Error:", err);
    if (err.response?.status === 429) {
      const retrySeconds = parseInt(err.response.headers["retry-after"]) || 60;
      setRetryAfter(retrySeconds);
      setError(`Too many requests. Please wait ${retrySeconds} seconds.`);

      const timer = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;

      // Get current order data
      const orderResponse = await axios.get(
        `${baseURL}/orders/GetOrders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const currentOrder = orderResponse.data.data;

      // Update order status
      await axios.patch(
        `${baseURL}/orders/${orderId}/admin`,
        {
          orderStatus: newStatus,
          shippingAddress: currentOrder.shippingAddress,
          mobileNumber: currentOrder.mobileNumber,
          items: currentOrder.items,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh orders
      await fetchOrders();
      setError("");
    } catch (err) {
      handleError(err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;

      await axios.delete(`${baseURL}/orders/${orderId}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchOrders();
      setError("");
    } catch (err) {
      handleError(err);
    }
  };

  const handleSearchByMobile = async () => {
    if (!searchMobile) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;

      const response = await axios.get(
        `${baseURL}/orders/user/${searchMobile}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders(response.data.data || []);
      setError("");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;

      await Promise.all(
        selectedOrders.map(async (orderId) => {
          const orderResponse = await axios.get(
            `${baseURL}/orders/GetOrders/${orderId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const currentOrder = orderResponse.data.data;

          return axios.patch(
            `${baseURL}/orders/${orderId}/admin`,
            {
              orderStatus: bulkAction,
              shippingAddress: currentOrder.shippingAddress,
              mobileNumber: currentOrder.mobileNumber,
              items: currentOrder.items,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        })
      );

      await fetchOrders();
      setSelectedOrders([]);
      setBulkAction("");
      setError("");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className={styles.manageOrders}>
      <h2>Manage Orders</h2>

      {error && <div className={styles.error}>{error}</div>}
      {retryAfter > 0 && (
        <div className={styles.retryTimer}>
          Please wait {retryAfter} seconds before making another request
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search by mobile number"
            value={searchMobile}
            onChange={(e) => setSearchMobile(e.target.value)}
            className={styles.searchInput}
          />
          <button
            onClick={handleSearchByMobile}
            className={styles.searchButton}
            disabled={!searchMobile || retryAfter > 0}
          >
            Search
          </button>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.filterSelect}
          disabled={retryAfter > 0}
        >
          <option value="all">All Orders</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        {selectedOrders.length > 0 && (
          <div className={styles.bulkActions}>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className={styles.actionSelect}
              disabled={retryAfter > 0}
            >
              <option value="">Select Action</option>
              <option value="pending">Mark as Pending</option>
              <option value="processing">Mark as Processing</option>
              <option value="shipped">Mark as Shipped</option>
              <option value="delivered">Mark as Delivered</option>
              <option value="cancelled">Mark as Cancelled</option>
            </select>
            <button
              onClick={handleBulkAction}
              className={styles.applyButton}
              disabled={!bulkAction || retryAfter > 0}
            >
              Apply to Selected
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading orders...</div>
      ) : (
        <div className={styles.ordersContainer}>
          {orders.length > 0 ? (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length}
                      onChange={(e) => {
                        setSelectedOrders(
                          e.target.checked
                            ? orders.map((order) => order._id)
                            : []
                        );
                      }}
                      disabled={retryAfter > 0}
                    />
                  </th>
                  <th>Order ID</th>
                  <th>Mobile</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => {
                          setSelectedOrders(
                            e.target.checked
                              ? [...selectedOrders, order._id]
                              : selectedOrders.filter((id) => id !== order._id)
                          );
                        }}
                        disabled={retryAfter > 0}
                      />
                    </td>
                    <td>{order._id}</td>
                    <td>{order.mobileNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={styles.statusSelect}
                        disabled={retryAfter > 0 || statusUpdateLoading}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>${order.totalAmount?.toFixed(2) || "0.00"}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <Link
                          to={`/orders/details/${order._id}`}
                          className={styles.viewButton}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className={styles.deleteButton}
                          disabled={retryAfter > 0}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noResults}>No orders found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
