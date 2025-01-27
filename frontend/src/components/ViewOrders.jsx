import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./ViewOrders.module.css";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    shippingAddress: "",
    mobileNumber: "",
    orderStatus: "",
    items: [],
  });

  const checkUserRole = async () => {
    console.log("Checking user role...");
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    if (!token) {
      setError("Please login first");
      return;
    }

    try {
      const response = await axios.get(`${baseURL}/orders/GetOrders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Admin check response:", response);
      setIsAdmin(true);
      setOrders(response.data.data || []);
    } catch (err) {
      console.log("Not admin, fetching my orders");
      try {
        const myOrdersResponse = await axios.get(
          `${baseURL}/orders/my-orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(myOrdersResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders");
      }
    }
  };

  const fetchFilteredOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      let url = `${baseURL}/orders/`;

      switch (filterType) {
        case "today":
          url += "today";
          break;
        case "week":
          url += "last-week";
          break;
        case "month":
          url += "last-month";
          break;
        case "user":
          if (userId) {
            url += `${userId}/user`;
          } else {
            setError("Please enter a user ID");
            setLoading(false);
            return;
          }
          break;
        default:
          url += "GetOrders";
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch filtered orders");
      setOrders([]);
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

      await fetchFilteredOrders();
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
      await fetchFilteredOrders();
      setError("Order updated successfully");
    } catch (err) {
      setError("Failed to update order");
    }
  };

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    if (filterType !== "all" && isAdmin) {
      fetchFilteredOrders();
    }
  }, [filterType]);

  return (
    <div className={styles.viewOrders}>
      <h2>Orders Dashboard</h2>
      {error && <p className={styles.error}>{error}</p>}

      {isAdmin && (
        <div className={styles.adminPanel}>
          <h3>Admin Tools</h3>
          <div className={styles.adminLinks}>
            <Link to="/orders/search" className={styles.adminButton}>
              Search Orders
            </Link>
            <Link to="/orders/user-search" className={styles.adminButton}>
              Search User Orders
            </Link>
            <Link to="/orders/manage" className={styles.adminButton}>
              Manage Orders
            </Link>
          </div>

          <div className={styles.filters}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Orders</option>
              <option value="today">Today's Orders</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loader}>Loading...</div>
      ) : (
        <div className={styles.ordersContainer}>
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
