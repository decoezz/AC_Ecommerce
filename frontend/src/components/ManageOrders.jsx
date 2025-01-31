import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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
  FaThermometerHalf,
  FaBolt,
  FaBoxes,
  FaShoppingCart,
  FaDollarSign,
  FaCalculator,
  FaEdit,
  FaCheck,
  FaTimes,
  FaBox,
  FaTruck,
} from "react-icons/fa";
import {
  MdOutlineLocalShipping,
  MdPending,
  MdDone,
  MdCancel,
  MdPayment,
  MdFilterList,
} from "react-icons/md";
import { BsBoxSeam, BsCurrencyDollar } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [searchMobile, setSearchMobile] = useState("");
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
  const [message, setMessage] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");

  // Define orderStatuses at the component level
  const orderStatuses = [
    "processing", // lowercase
    "shipped", // lowercase
    "delivered", // lowercase
    "canceled", // lowercase
    "on hold", // lowercase
  ];

  const fetchOrders = async () => {
    // Add loading check to prevent multiple requests
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

      console.log("Fetched orders:", response.data);

      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        setOrders(response.data.data);
        setAllOrders(response.data.data);
        setError("");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (err.response?.status === 429) {
        setError(
          "Too many requests. Please wait a moment before trying again."
        );
        // Add a delay before retrying
        setTimeout(() => {
          setError("");
          setIsLoading(false);
        }, 5000); // Wait 5 seconds before allowing retry
        return;
      }
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to handle cleanup
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

  // Check server connection
  const checkServerConnection = async () => {
    try {
      await axios.get("http://127.0.0.1:4000/api/v1/health"); // You might need to create this endpoint
      return true;
    } catch (error) {
      console.error("Server connection error:", error);
      return false;
    }
  };

  // Function to fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:4000/api/v1/orders/GetOrders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure we have the correct data structure
      const orderData = response.data.data || response.data;
      if (!orderData) {
        throw new Error("Invalid order data received");
      }
      return orderData;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw new Error("Failed to fetch order details");
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
        toast.success("Order status updated successfully");
        await fetchOrders(); // Refresh orders
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const token = localStorage.getItem("token");
      const baseURL = "http://127.0.0.1:4000/api/v1";

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
      const baseURL = "http://127.0.0.1:4000/api/v1";

      const response = await axios.get(
        `${baseURL}/orders/user/${searchMobile}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle single order response
      if (response.data.data?.order) {
        setOrders([response.data.data.order]);
      } else {
        setOrders([]);
      }
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
      const baseURL = "http://127.0.0.1:4000/api/v1";

      await Promise.all(
        selectedOrders.map(async (orderId) => {
          return axios.patch(
            `${baseURL}/orders/${orderId}/admin`,
            {
              status: bulkAction,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <MdPending className={`${styles.statusIcon} ${styles.pendingIcon}`} />
        );
      case "processing":
        return (
          <BsBoxSeam
            className={`${styles.statusIcon} ${styles.processingIcon}`}
          />
        );
      case "shipped":
        return (
          <MdOutlineLocalShipping
            className={`${styles.statusIcon} ${styles.shippedIcon}`}
          />
        );
      case "delivered":
        return (
          <MdDone className={`${styles.statusIcon} ${styles.deliveredIcon}`} />
        );
      case "cancelled":
        return (
          <MdCancel
            className={`${styles.statusIcon} ${styles.cancelledIcon}`}
          />
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#FFCC80", // Warm Orange
      processing: "#64B5F6", // Soft Blue
      shipped: "#B39DDB", // Muted Purple
      delivered: "#81C784", // Fresh Green
      canceled: "#E57373", // Soft Red
    };
    return colors[status] ?? "#524949";
  };

  const handleDeleteClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = "http://127.0.0.1:4000/api/v1";
      await axios.delete(`${baseURL}/orders/${selectedOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== selectedOrderId)
      );
      setShowConfirmDelete(false);
      setSelectedOrderId(null);
    } catch (err) {
      console.error("Error deleting order:", err);
      setError("Failed to delete order");
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders
      .filter((order) => {
        // Mobile number filter
        const mobileMatch = mobileSearch
          ? order.mobileNumber?.includes(mobileSearch)
          : true;

        // Status filter
        const statusMatch =
          filterStatus === "all" || order.status === filterStatus;

        // Combine filters
        return mobileMatch && statusMatch;
      })
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [orders, filterStatus, sortOrder, mobileSearch]);

  // Debounce function
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

  // Debounced search with minimum length check
  const debouncedSearch = debounce((term) => {
    // Only search if we have at least 11 digits
    const digitsOnly = term.replace(/\D/g, "");
    if (digitsOnly.length === 11) {
      searchByPhone(digitsOnly);
    } else if (!term.trim()) {
      fetchOrders();
    }
  }, 500);

  // Handle search input change with formatting
  const handleSearchChange = (e) => {
    let value = e.target.value;

    // Only allow numbers and common separators
    value = value.replace(/[^\d-\s()]/g, "");

    // Format as phone number: 01234567890
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      setSearchTerm(value);
      debouncedSearch(value);
    }
  };

  // Reset search
  const handleClearSearch = () => {
    setSearchTerm("");
    fetchOrders();
  };

  // Function to fetch AC details
  const fetchAcDetails = async (acId) => {
    try {
      console.log("Fetching AC details for:", acId);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:4000/api/v1/products/${acId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("AC details response:", response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching AC details:", error);
      return {
        brand: "N/A",
        model: "N/A",
      };
    }
  };

  // Fetch AC details when order is selected
  useEffect(() => {
    const fetchAllAcDetails = async () => {
      if (selectedOrder?.items && selectedOrder.items.length > 0) {
        setIsLoadingAc(true);
        console.log("Selected order items:", selectedOrder.items);

        try {
          const acPromises = selectedOrder.items.map((item) =>
            fetchAcDetails(item.ac)
          );

          const acResults = await Promise.all(
            acPromises.map((p) =>
              p.catch((e) => ({
                brand: "N/A",
                model: "N/A",
              }))
            )
          );

          const newAcDetails = {};
          selectedOrder.items.forEach((item, index) => {
            newAcDetails[item.ac] = acResults[index];
          });

          console.log("Fetched AC details:", newAcDetails);
          setAcDetails(newAcDetails);
        } catch (error) {
          console.error("Error fetching AC details:", error);
          setError("Failed to load AC details");
        } finally {
          setIsLoadingAc(false);
        }
      }
    };

    fetchAllAcDetails();
  }, [selectedOrder]);

  const renderOrderItems = (items) => {
    return items.map((item, index) => {
      const acDetail = acDetails[item.ac];

      return (
        <div key={index} className={styles.itemCard}>
          <div className={styles.itemDetails}>
            <div className={styles.itemInfo}>
              <div className={styles.itemHeader}>
                <div className={styles.productHeader}>
                  <div className={styles.productInfo}>
                    <h4 className={styles.itemTitle}>{acDetail?.brand}</h4>
                    <span className={styles.modelBadge}>
                      Model: {item.modelNumber}
                    </span>
                    <div className={styles.productMeta}>
                      <span className={styles.productId}>ID: {item.ac}</span>
                      <span className={styles.quantity}>
                        Quantity: {item.quantity}
                      </span>
                      <span className={styles.price}>
                        Price: ${item.priceAtPurchase}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalWrapper}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  };

  const renderOrderDetails = () => {
    return (
      <Modal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
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
                    value={selectedOrder?.orderStatus || "Pending"}
                    onChange={(e) =>
                      handleStatusUpdate(selectedOrder?._id, e.target.value)
                    }
                    className={styles.statusSelect}
                    data-status={selectedOrder?.orderStatus?.toLowerCase()}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`${styles.statusBadge} ${
                      styles[selectedOrder?.orderStatus?.toLowerCase()]
                    }`}
                  >
                    {selectedOrder?.orderStatus}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.orderSection}>
              <div className={styles.sectionHeader}>
                <FaUser className={styles.sectionIcon} />
                <h4>Customer Information</h4>
              </div>
              <div className={styles.customerDetails}>
                <p>
                  <FaUser /> {selectedOrder?.customerName}
                </p>
                <p>
                  <FaPhone /> {selectedOrder?.mobileNumber}
                </p>
                <p>
                  <FaMapMarkerAlt /> {selectedOrder?.shippingAddress}
                </p>
              </div>
            </div>

            <div className={styles.orderSection}>
              <div className={styles.sectionHeader}>
                <FaTruck className={styles.sectionIcon} />
                <h4>Order Items</h4>
              </div>
              <div className={styles.itemsList}>
                {selectedOrder?.items?.map((item, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemInfo}>
                        <h5>{item.brand || "Product"}</h5>
                        <p className={styles.modelNumber}>
                          Model: {item.modelNumber}
                        </p>
                        <p className={styles.quantity}>
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className={styles.itemPrice}>
                        <FaDollarSign />
                        {item.priceAtPurchase}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.orderSection}>
              <div className={styles.sectionHeader}>
                <FaDollarSign className={styles.sectionIcon} />
                <h4>Payment Details</h4>
              </div>
              <div className={styles.paymentDetails}>
                <div className={styles.paymentRow}>
                  <span>Total Amount:</span>
                  <span className={styles.amount}>
                    ${selectedOrder?.totalAmount}
                  </span>
                </div>
                <div className={styles.paymentRow}>
                  <span>Payment Status:</span>
                  <span
                    className={`${styles.paymentStatus} ${
                      styles[selectedOrder?.paymentStatus]
                    }`}
                  >
                    {selectedOrder?.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.orderSection}>
              <div className={styles.sectionHeader}>
                <FaCalendarAlt className={styles.sectionIcon} />
                <h4>Order Timeline</h4>
              </div>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineDate}>
                    {new Date(selectedOrder?.purchasedAt).toLocaleDateString()}
                  </span>
                  <span className={styles.timelineLabel}>Order Placed</span>
                </div>
                {selectedOrder?.updatedAt && (
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineDate}>
                      {new Date(selectedOrder?.updatedAt).toLocaleDateString()}
                    </span>
                    <span className={styles.timelineLabel}>Last Updated</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  // Add this function to handle mobile number search
  const handleMobileSearch = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Only allow numbers
    setMobileSearch(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>
          <BsBoxSeam className={styles.titleIcon} />
          Order Management Dashboard
        </h1>
      </div>

      <div className={styles.controlsContainer}>
        {/* Mobile search input without phone icon */}
        <div className={styles.searchGroup}>
          <label className={styles.searchLabel}>Search by Mobile:</label>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.mobileSearchInput}
              placeholder="Enter mobile number..."
              value={mobileSearch}
              onChange={handleMobileSearch}
              maxLength={15}
            />
            {mobileSearch && (
              <button
                className={styles.clearSearch}
                onClick={() => setMobileSearch("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ... rest of your existing controls ... */}
      </div>

      <div className={styles.searchStats}>
        <span className={styles.resultCount}>
          {searchTerm
            ? `Showing orders for: ${searchTerm}`
            : `Showing ${filteredOrders.length} orders`}
          {filterStatus !== "all" && ` • Status: ${filterStatus}`}
        </span>
      </div>

      <div className={styles.ordersGrid}>
        {isLoading && !editingOrder ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button
              onClick={() => {
                if (!isLoading) {
                  fetchOrders();
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : "Retry"}
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderIdSection}>
                  <span className={styles.orderIdLabel}>Order ID</span>
                  <span className={styles.orderId}>#{order._id.slice(-6)}</span>
                </div>
                <div className={styles.orderActions}>
                  <button
                    onClick={() => handleViewDetails(order)}
                    className={`${styles.actionButton} ${styles.viewButton}`}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    onClick={() => handleDeleteClick(order._id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
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
                    {renderOrderItems(order.items || [])}
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
                    {editingOrder === order._id.$oid ? (
                      <select
                        value={selectedOrder?.orderStatus || "pending"}
                        onChange={(e) =>
                          handleStatusUpdate(selectedOrder?._id, e.target.value)
                        }
                        className={styles.statusSelect}
                        data-status={selectedOrder?.orderStatus || "pending"}
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
                      >
                        {(order.orderStatus || "pending").toUpperCase()}
                      </span>
                    )}
                  </div>
                  {updateError && (
                    <div className={styles.error}>{updateError}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <FaPhone className={styles.noResultsIcon} />
            <h3>No Orders Found</h3>
            <p>{error || "Try adjusting your search or filter criteria"}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this order?</p>
            <div className={styles.modalActions}>
              <button
                onClick={handleConfirmDelete}
                className={styles.confirmDelete}
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className={styles.cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && renderOrderDetails()}
    </div>
  );
};

export default ManageOrders;
