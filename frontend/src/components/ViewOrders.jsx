import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ViewOrders.module.css";

const ViewOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [editForm, setEditForm] = useState({
    shippingAddress: "",
    mobileNumber: "",
    orderStatus: "",
    items: [],
  });

  const formatDate = (date) => {
    try {
      const orderDate = new Date(date);
      return orderDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date not available";
    }
  };

  const checkUserRole = async () => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    if (!token) {
      setError("Please login first");
      return;
    }

    if (retryAfter > 0) {
      setError(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/orders/GetOrders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAdmin(true);
      setOrders(response.data.data || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 429) {
        const retrySeconds =
          parseInt(err.response.headers["retry-after"]) || 60;
        setRetryAfter(retrySeconds);
        setError(`Too many requests. Please wait ${retrySeconds} seconds.`);

        // Start countdown timer
        const timer = setInterval(() => {
          setRetryAfter((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              // Retry the request after countdown
              checkUserRole();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        console.log("Not admin, fetching my orders");
        try {
          const myOrdersResponse = await axios.get(
            `${baseURL}/orders/my-orders`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setOrders(myOrdersResponse.data.data || []);
          setError("");
        } catch (myOrdersErr) {
          if (myOrdersErr.response?.status === 429) {
            const retrySeconds =
              parseInt(myOrdersErr.response.headers["retry-after"]) || 60;
            setRetryAfter(retrySeconds);
            setError(`Too many requests. Please wait ${retrySeconds} seconds.`);
          } else {
            console.log("Error fetching orders:", myOrdersErr);
            setError(
              myOrdersErr.response?.data?.message || "Failed to fetch orders"
            );
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (type) => {
    setFilterType(type);
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      // Get all orders first
      const response = await axios.get(
        "http://127.0.0.1:4000/api/v1/orders/GetOrders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let filteredOrders = response.data.data || [];

      // Filter the orders based on the selected type
      switch (type) {
        case "today": {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filteredOrders = filteredOrders.filter((order) => {
            const orderDate = new Date(order.purchasedAt);
            return orderDate >= today;
          });
          break;
        }
        case "week": {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filteredOrders = filteredOrders.filter((order) => {
            const orderDate = new Date(order.purchasedAt);
            return orderDate >= weekAgo;
          });
          break;
        }
        case "month": {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filteredOrders = filteredOrders.filter((order) => {
            const orderDate = new Date(order.purchasedAt);
            return orderDate >= monthAgo;
          });
          break;
        }
        default:
          // "all" - no filtering needed
          break;
      }

      setOrders(filteredOrders);
      setError("");
    } catch (err) {
      console.error("Filter error:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;
      const endpoint = isAdmin
        ? `${baseURL}/orders/${orderId}/admin`
        : `${baseURL}/orders/${orderId}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await handleFilterChange("all");
      setError("Order deleted successfully");
    } catch (err) {
      setError("Failed to delete order");
    }
  };

  const handleEdit = async (order) => {
    setSelectedOrder(order);
    setEditForm({
      shippingAddress: order.shippingAddress || "",
      mobileNumber: order.mobileNumber || "",
      orderStatus: order.status || "",
      items: order.items || [],
    });
    setEditMode(true);
  };

  const handleEditSubmit = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;
      const endpoint = isAdmin
        ? `${baseURL}/orders/${orderId}/admin`
        : `${baseURL}/orders/${orderId}`;

      await axios.patch(endpoint, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditMode(false);
      await handleFilterChange("all");
      setError("Order updated successfully");
    } catch (err) {
      setError("Failed to update order");
    }
  };

  useEffect(() => {
    checkUserRole();
  }, []);

  return (
    <div className={styles.viewOrders}>
      <div className={styles.header}>
        <h2 className={styles.title}>Orders</h2>
        <button
          onClick={() => navigate("/orders/create")}
          className={styles.createButton}
        >
          Create New Order
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {retryAfter > 0 && (
        <div className={styles.retryTimer}>
          Please wait {retryAfter} seconds before making another request
        </div>
      )}

      {isAdmin && (
        <div className={styles.adminPanel}>
          <h3>Admin Tools</h3>
          <div className={styles.adminLinks}>
            <Link to="/orders/search" className={styles.adminButton}>
              Search Orders
            </Link>
            <Link to="/orders/manage" className={styles.adminButton}>
              Manage Orders
            </Link>
          </div>

          <div className={styles.filters}>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className={styles.filterSelect}
              disabled={retryAfter > 0}
            >
              <option value="all">All Orders</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading orders...</div>
      ) : (
        <div className={styles.ordersContainer}>
          {orders.length > 0 ? (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{formatDate(order.purchasedAt)}</td>
                    <td>
                      <span
                        className={
                          styles[order.orderStatus?.toLowerCase() || "pending"]
                        }
                      >
                        {order.orderStatus || "Pending"}
                      </span>
                    </td>
                    <td>${order.totalAmount?.toFixed(2) || "0.00"}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noOrders}>
              <p>No orders found.</p>
              <button
                onClick={() => navigate("/orders/create")}
                className={styles.createButton}
              >
                Create Your First Order
              </button>
            </div>
          )}
        </div>
      )}

      {editMode && selectedOrder && (
        <div className={styles.editModal}>
          <h3>Edit Order</h3>
          <input
            type="text"
            value={editForm.shippingAddress}
            onChange={(e) =>
              setEditForm({ ...editForm, shippingAddress: e.target.value })
            }
            placeholder="Shipping Address"
          />
          <input
            type="text"
            value={editForm.mobileNumber}
            onChange={(e) =>
              setEditForm({ ...editForm, mobileNumber: e.target.value })
            }
            placeholder="Mobile Number"
          />
          {isAdmin && (
            <select
              value={editForm.orderStatus}
              onChange={(e) =>
                setEditForm({ ...editForm, orderStatus: e.target.value })
              }
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          <button onClick={() => handleEditSubmit(selectedOrder._id)}>
            Save
          </button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;
