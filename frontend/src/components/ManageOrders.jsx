import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./ManageOrders.module.css";
import {
  FaSpinner,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTrash,
  FaEye,
  FaExclamationTriangle,
  FaBox,
  FaTruck,
  FaDollarSign,
  FaEdit,
} from "react-icons/fa";
import {
  MdOutlineLocalShipping,
  MdPending,
  MdDone,
  MdCancel,
  MdPayment,
} from "react-icons/md";
import { BsBoxSeam, BsCurrencyDollar } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [acDetails, setAcDetails] = useState({});
  const [isLoadingAc, setIsLoadingAc] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Define order statuses
  const orderStatuses = [
    "processing",
    "shipped",
    "delivered",
    "canceled",
    "on hold",
  ];

  const fetchOrders = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios({
        method: "GET",
        url: "http://127.0.0.1:4000/api/v1/orders/GetOrders",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "success" && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
        setError("");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      if (!mounted) return;
      await fetchOrders();
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const searchByPhone = async (phoneNumber) => {
    if (!phoneNumber) return;
    
    try {
      setIsSearching(true);
      const token = localStorage.getItem("token");
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      const response = await axios.get(
        `http://127.0.0.1:4000/api/v1/orders/user/${formattedPhone}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === "success") {
        const ordersData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        
        setOrders(ordersData);
        setError("");
      } else {
        setOrders([]);
        setError("No orders found for this mobile number");
      }
    } catch (err) {
      console.error("Error searching orders:", err);
      setOrders([]);
      setError(err.response?.data?.message || "Failed to find orders");
    } finally {
      setIsSearching(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const formattedStatus = newStatus.toLowerCase();

      const response = await axios({
        method: "PATCH",
        url: `http://127.0.0.1:4000/api/v1/orders/${orderId}/admin`,
        data: { orderStatus: formattedStatus },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "success") {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, orderStatus: formattedStatus }
              : order
          )
        );

        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: formattedStatus }));
        }

        toast.success("Order status updated successfully");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:4000/api/v1/orders/${orderId}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      setShowConfirmDelete(false);
      setSelectedOrderId(null);
      toast.success("Order deleted successfully");
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedSearch = debounce((term) => {
    const digitsOnly = term.replace(/\D/g, "");
    if (digitsOnly.length === 11) {
      searchByPhone(digitsOnly);
    } else if (!term.trim()) {
      fetchOrders();
    }
  }, 500);

  const handleSearchChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d-\s()]/g, "");
    
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      setSearchTerm(value);
      debouncedSearch(value);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setError("");
    fetchOrders();
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDeleteClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmDelete(true);
  };

  const startEditing = (orderId) => {
    setEditingOrder(orderId);
    setIsEditing(true);
  };

  const stopEditing = () => {
    setEditingOrder(null);
    setIsEditing(false);
  };

  const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>,
      document.body
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#FFCC80",
      processing: "#64B5F6",
      shipped: "#B39DDB",
      delivered: "#81C784",
      canceled: "#E57373",
    };
    return colors[status] ?? "#524949";
  };

  const renderOrderDetails = () => {
    return (
      <Modal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          stopEditing();
        }}
      >
        <div className={styles.orderDetailsModal}>
          <div className={styles.modalHeader}>
            <h3>Order #{selectedOrder?._id?.slice(-6)}</h3>
            <div className={styles.headerActions}>
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Save Changes" : "Edit Order"}
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setShowOrderDetails(false)}
              >
                Close
              </button>
            </div>
          </div>

          <div className={styles.orderDetailsContent}>
            <div className={styles.orderSection}>
              <div className={styles.sectionHeader}>
                <FaBox className={styles.sectionIcon} />
                <h4>Order Status</h4>
              </div>
              <div className={styles.statusContainer}>
                {isEditing ? (
                  <select
                    value={selectedOrder?.orderStatus || "pending"}
                    onChange={(e) => {
                      handleStatusUpdate(selectedOrder?._id, e.target.value);
                      stopEditing();
                    }}
                    className={styles.statusSelect}
                    data-status={selectedOrder?.orderStatus?.toLowerCase()}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`${styles.statusBadge} ${
                      styles[selectedOrder?.orderStatus?.toLowerCase()]
                    }`}
                  >
                    {selectedOrder?.orderStatus?.toUpperCase() || "PENDING"}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.customerSection}>
              <h3>Customer Information</h3>
              <div className={styles.customerDetails}>
                <p><FaUser /> {selectedOrder?.customerName}</p>
                <p><FaPhone /> {selectedOrder?.mobileNumber}</p>
                <p><FaMapMarkerAlt /> {selectedOrder?.shippingAddress}</p>
              </div>
            </div>

            <div className={styles.itemsSection}>
              <h3>Order Items</h3>
              {selectedOrder?.items?.map((item, index) => (
                <div key={index} className={styles.itemCard}>
                  <div className={styles.itemDetails}>
                    <h4>{item.brand || "Product"}</h4>
                    <p>Model: {item.modelNumber}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.priceAtPurchase}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.paymentSection}>
              <h3>Payment Details</h3>
              <div className={styles.paymentDetails}>
                <p>Total Amount: ${selectedOrder?.totalAmount}</p>
                <p>Payment Status: {selectedOrder?.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders
      .filter((order) => {
        return filterStatus === "all" || order.status === filterStatus;
      })
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [orders, filterStatus, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>
          <BsBoxSeam className={styles.titleIcon} />
          Order Management Dashboard
        </h1>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by mobile number (e.g., 01234567890)"
            className={styles.searchInput}
          />
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className={styles.clearSearch}
            >
              Clear
            </button>
          )}
        </div>
        {isSearching && (
          <div className={styles.searchStatus}>
            <FaSpinner className={styles.spinner} />
            <span>Searching...</span>
          </div>
        )}
        {error && (
          <div className={styles.searchError}>
            {error}
          </div>
        )}
      </div>

      <div className={styles.ordersGrid}>
        {isLoading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>#{order._id.slice(-6)}</span>
                <div className={styles.orderActions}>
                  <button
                    onClick={() => handleViewDetails(order)}
                    className={styles.viewButton}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    onClick={() => handleDeleteClick(order._id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              <div className={styles.orderContent}>
                <div className={styles.customerSection}>
                  <h3>
                    <FaUser className={styles.icon} /> Customer Information
                  </h3>
                  <div className={styles.customerDetails}>
                    <p>
                      <FaMapMarkerAlt className={styles.icon} />{" "}
                      {order.shippingAddress || "No address provided"}
                    </p>
                    <p>
                      <FaPhone className={styles.icon} />{" "}
                      {order.mobileNumber || "No phone provided"}
                    </p>
                  </div>
                </div>

                <div className={styles.itemsSection}>
                  <h3>
                    <BsBoxSeam className={styles.icon} /> Order Items
                  </h3>
                  <div className={styles.itemsList}>
                    {order.items?.map((item, index) => (
                      <div key={index} className={styles.itemCard}>
                        <div className={styles.itemDetails}>
                          <h4>{item.brand || "Product"}</h4>
                          <p>Model: {item.modelNumber}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${item.priceAtPurchase}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.paymentSection}>
                  <h3>
                    <MdPayment className={styles.icon} /> Payment Details
                  </h3>
                  <div className={styles.paymentDetails}>
                    <div className={styles.paymentItem}>
                      <span>Total Amount:</span>
                      <span className={styles.amount}>
                        <BsCurrencyDollar className={styles.icon} />
                        {order.totalAmount}
                      </span>
                    </div>
                    <div className={styles.paymentItem}>
                      <span>Payment Status:</span>
                      <span className={styles.paymentStatus}>
                        {order.paymentStatus || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.statusSection}>
                  <h3>Order Status</h3>
                  <div className={styles.statusSelectWrapper}>
                    {editingOrder === order._id ? (
                      <select
                        value={order.orderStatus || "pending"}
                        onChange={(e) => {
                          handleStatusUpdate(order._id, e.target.value);
                          stopEditing();
                        }}
                        className={styles.statusSelect}
                        data-status={order.orderStatus || "pending"}
                        disabled={isLoading}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: getStatusColor(
                            order.orderStatus || "pending"
                          ),
                        }}
                        onClick={() => startEditing(order._id)}
                      >
                        {(order.orderStatus || "pending").toUpperCase()}
                      </span>
                    )}
                  </div>
                  {updateError && (
                    <div className={styles.error}>{updateError}</div>
                  )}
                </div>

                <div className={styles.orderDates}>
                  <p>
                    <FaCalendarAlt className={styles.icon} /> Created:{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.updatedAt && (
                    <p>
                      <FaClock className={styles.icon} /> Last Updated:{" "}
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <FaExclamationTriangle className={styles.noResultsIcon} />
            <h3>No Orders Found</h3>
            <p>{error || "Try adjusting your search or filter criteria"}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
      >
        <div className={styles.confirmDeleteModal}>
          <h2>Confirm Delete</h2>
          <p>Are you sure you want to delete this order? This action cannot be undone.</p>
          <div className={styles.modalActions}>
            <button
              onClick={() => {
                handleDelete(selectedOrderId);
                setShowConfirmDelete(false);
              }}
              className={styles.deleteButton}
            >
              Delete
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && renderOrderDetails()}
    </div>
  );
};

export default ManageOrders;