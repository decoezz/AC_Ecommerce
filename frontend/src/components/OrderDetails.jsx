import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./OrderDetails.jsx";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    shippingAddress: "",
    mobileNumber: "",
    orderStatus: "",
  });

  useEffect(() => {
    // Check authentication and roles
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // Allow only Admin and Employee roles
    if (
      !token ||
      !user ||
      (user.role !== "Admin" && user.role !== "employee")
    ) {
      navigate("/not-found");
      return;
    }

    fetchOrderDetails();
  }, [navigate, orderId]);

  const fetchOrderDetails = async () => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.get(
        `${baseURL}/orders/GetOrders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrder(response.data.data);
      setIsAdmin(true);
      setEditForm({
        shippingAddress: response.data.data.shippingAddress,
        mobileNumber: response.data.data.mobileNumber,
        orderStatus: response.data.data.status,
      });
    } catch (err) {
      if (err.response?.status === 403) {
        // Not admin, try getting as regular user
        try {
          const userResponse = await axios.get(`${baseURL}/orders/my-orders`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userOrder = userResponse.data.data.find(
            (o) => o._id === orderId
          );
          if (userOrder) {
            setOrder(userOrder);
          } else {
            setError("Order not found");
          }
        } catch (error) {
          setError("Failed to fetch order details");
        }
      } else {
        setError("Failed to fetch order details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      const endpoint = isAdmin
        ? `${baseURL}/orders/${orderId}/admin`
        : `${baseURL}/orders/${orderId}`;

      await axios.patch(endpoint, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditMode(false);
      fetchOrderDetails();
    } catch (err) {
      setError("Failed to update order");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL;

    try {
      const endpoint = isAdmin
        ? `${baseURL}/orders/${orderId}/admin`
        : `${baseURL}/orders/${orderId}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/orders");
    } catch (err) {
      setError("Failed to delete order");
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!order) return <div className={styles.error}>Order not found</div>;

  return (
    <div className={styles.orderDetails}>
      <h2>Order Details</h2>
      <div className={styles.orderInfo}>
        <div className={styles.section}>
          <h3>Order Information</h3>
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Total Amount:</strong> $
            {(order.totalAmount || 0).toFixed(2)}
          </p>
        </div>

        <div className={styles.section}>
          <h3>Shipping Information</h3>
          {editMode ? (
            <>
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
            </>
          ) : (
            <>
              <p>
                <strong>Address:</strong> {order.shippingAddress}
              </p>
              <p>
                <strong>Mobile:</strong> {order.mobileNumber}
              </p>
            </>
          )}
        </div>

        <div className={styles.section}>
          <h3>Items</h3>
          <div className={styles.itemsList}>
            {order.items?.map((item) => (
              <div key={item._id} className={styles.item}>
                <p>
                  <strong>{item.product?.name || "Unknown Product"}</strong>
                </p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${(item.priceAtPurchase || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          {editMode ? (
            <>
              <button onClick={handleUpdate} className={styles.saveButton}>
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className={styles.editButton}
              >
                Edit Order
              </button>
              <button onClick={handleDelete} className={styles.deleteButton}>
                Delete Order
              </button>
            </>
          )}
          <button
            onClick={() => navigate("/orders")}
            className={styles.backButton}
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
