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

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = "http://127.0.0.1:4000/api/v1";

      // Simplified to use single endpoint for all orders
      const response = await axios.get(`${baseURL}/orders/GetOrders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let filteredOrders = response.data.data || [];

      // Client-side filtering
      switch (filter) {
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
      }

      setOrders(filteredOrders);
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

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      setUpdateError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Using status instead of orderStatus
      const updateData = {
        status: newStatus, // Changed from orderStatus to status
      };

      console.log("Updating order status:", {
        orderId,
        updateData,
        endpoint: `http://127.0.0.1:4000/api/v1/orders/${orderId}/admin`,
      });

      const response = await axios.patch(
        `http://127.0.0.1:4000/api/v1/orders/${orderId}/admin`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Update the local state using status instead of orderStatus
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );

        // Update selected order
        setSelectedOrder((prev) => ({
          ...prev,
          status: newStatus,
        }));

        toast.success("Order status updated successfully");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to update order status";

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Not authorized. Please login as admin or employee";
            break;
          case 403:
            errorMessage = "You do not have permission to update orders";
            break;
          case 404:
            errorMessage = "Order not found";
            break;
          case 400:
            errorMessage = error.response.data?.message || "Invalid order data";
            break;
          case 500:
            errorMessage = "Server error. Please check server logs.";
            break;
          default:
            errorMessage =
              error.response.data?.message || "Failed to update order status";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please try again";
      } else {
        errorMessage = error.message;
      }

      setUpdateError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date";
    }
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
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "processing":
        return styles.statusProcessing;
      case "shipped":
        return styles.statusShipped;
      case "delivered":
        return styles.statusDelivered;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return "";
    }
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
        // Only filter by status if it's not 'all'
        return filterStatus === "all" || order.status === filterStatus;
      })
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [orders, filterStatus, sortOrder]);

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

  // Search by phone number
  const searchByPhone = async (phoneNumber) => {
    try {
      setIsSearching(true);
      const token = localStorage.getItem("token");

      if (!phoneNumber || phoneNumber.length < 11) {
        if (!phoneNumber.trim()) {
          fetchOrders();
        }
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:4000/api/v1/orders/${phoneNumber}/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
        setError("");
      } else {
        setOrders([]);
        setError("No orders found for this phone number");
      }
    } catch (error) {
      console.error("Error searching orders:", error);
      setOrders([]);

      if (error.response?.status === 401) {
        setError("Not authorized. Please login as admin or employee");
      } else if (error.response?.status === 404) {
        setError("No orders found for this phone number");
      } else {
        setError("Failed to search orders. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
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
      return null;
    }
  };

  // Fetch AC details when order is selected
  useEffect(() => {
    const fetchAllAcDetails = async () => {
      if (selectedOrder?.items) {
        setIsLoadingAc(true);
        console.log("Selected order items:", selectedOrder.items);

        try {
          const acPromises = selectedOrder.items.map((item) =>
            fetchAcDetails(item.ac)
          );

          const acResults = await Promise.all(acPromises);
          const newAcDetails = {};

          selectedOrder.items.forEach((item, index) => {
            if (acResults[index]) {
              newAcDetails[item.ac] = acResults[index];
            }
          });

          console.log("Fetched AC details:", newAcDetails);
          setAcDetails(newAcDetails);
        } catch (error) {
          console.error("Error fetching AC details:", error);
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
                {isLoadingAc ? (
                  <div className={styles.loadingContainer}>
                    <FaSpinner className={styles.loadingSpinner} />
                    <span>Loading AC details...</span>
                  </div>
                ) : acDetail ? (
                  <div className={styles.productHeader}>
                    <div className={styles.productImage}>
                      <img
                        src={acDetail.image || "default-ac.png"}
                        alt={acDetail.brand}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <h4 className={styles.itemTitle}>
                        {acDetail.brand || "Unknown Brand"}
                      </h4>
                      <span className={styles.modelBadge}>
                        Model: {acDetail.modelNumber || "Unknown Model"}
                      </span>
                      <div className={styles.productMeta}>
                        <span className={styles.productId}>ID: {item.ac}</span>
                        <span
                          className={`${styles.stockBadge} ${
                            acDetail.inStock
                              ? styles.inStock
                              : styles.outOfStock
                          }`}
                        >
                          {acDetail.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.errorState}>
                    <FaExclamationTriangle className={styles.errorIcon} />
                    <h4 className={styles.itemTitle}>
                      AC Unit (ID: {item.ac})
                    </h4>
                  </div>
                )}
              </div>

              {acDetail && (
                <div className={styles.specGrid}>
                  <div className={styles.specCard}>
                    <FaThermometerHalf className={styles.specIcon} />
                    <div className={styles.specContent}>
                      <span className={styles.specLabel}>Cooling Capacity</span>
                      <span className={styles.specValue}>
                        {acDetail.coolingCapacity} BTU
                      </span>
                    </div>
                  </div>
                  <div className={styles.specCard}>
                    <FaBolt className={styles.specIcon} />
                    <div className={styles.specContent}>
                      <span className={styles.specLabel}>
                        Power Consumption
                      </span>
                      <span className={styles.specValue}>
                        {acDetail.powerConsumption}W
                      </span>
                    </div>
                  </div>
                  <div className={styles.specCard}>
                    <FaBoxes className={styles.specIcon} />
                    <div className={styles.specContent}>
                      <span className={styles.specLabel}>Stock Level</span>
                      <span className={styles.specValue}>
                        {acDetail.quantityInStock || 0} units
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.orderSummary}>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <FaShoppingCart />
                    </div>
                    <div className={styles.summaryContent}>
                      <span className={styles.summaryLabel}>Quantity</span>
                      <span className={styles.summaryValue}>
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <FaDollarSign />
                    </div>
                    <div className={styles.summaryContent}>
                      <span className={styles.summaryLabel}>Unit Price</span>
                      <span className={styles.summaryValue}>
                        ${(item.priceAtPurchase || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <FaCalculator />
                    </div>
                    <div className={styles.summaryContent}>
                      <span className={styles.summaryLabel}>Total</span>
                      <span className={styles.summaryValue}>
                        $
                        {(
                          (item.priceAtPurchase || 0) * item.quantity
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {acDetail && acDetail.price !== item.priceAtPurchase && (
                  <div className={styles.priceHistory}>
                    <span className={styles.priceLabel}>Original Price:</span>
                    <span className={styles.originalPrice}>
                      ${acDetail.price.toLocaleString()}
                    </span>
                    <span className={styles.priceDiff}>
                      {item.priceAtPurchase < acDetail.price
                        ? "Saved"
                        : "Increased"}
                      : $
                      {Math.abs(
                        acDetail.price - item.priceAtPurchase
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
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
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <input
                type="tel"
                placeholder="Enter 11-digit phone number..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
                maxLength="11"
              />
              {isSearching && <FaSpinner className={styles.searchSpinner} />}
            </div>
          </div>
        </div>

        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="on hold">On Hold</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
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
        {filteredOrders.length > 0 ? (
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
                    {getStatusIcon(order.status)}
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value).catch(
                          (error) => {
                            console.error("All retries failed:", error);
                            toast.error(
                              "Failed to update status after multiple attempts"
                            );
                          }
                        )
                      }
                      className={`${styles.statusSelect} ${getStatusColor(
                        order.status
                      )} ${statusUpdateLoading ? styles.loading : ""}`}
                      disabled={statusUpdateLoading}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {statusUpdateLoading && (
                      <FaSpinner className={styles.spinner} />
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
      {showOrderDetails && selectedOrder && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Order Details</h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Customer Information</h3>
                <div className={styles.customerInfo}>
                  <p>{selectedOrder.shippingAddress}</p>
                  <p>{selectedOrder.mobileNumber}</p>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Order Items</h3>
                <div className={styles.itemsList}>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <>
                      {renderOrderItems(selectedOrder.items)}
                      <div className={styles.orderSummary}>
                        <div className={styles.summaryItem}>
                          <span>Total Items:</span>
                          <span>{selectedOrder.items.length}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span>Total Amount:</span>
                          <span>
                            ${selectedOrder.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.noItems}>No items in this order</div>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Payment Details</h3>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentRow}>
                    <span>Total Amount:</span>
                    <span className={styles.totalAmount}>
                      ${selectedOrder.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Payment Status:</span>
                    <span
                      className={`${styles.paymentStatus} ${
                        styles[
                          selectedOrder.paymentStatus?.toLowerCase() ||
                            "pending"
                        ]
                      }`}
                    >
                      {selectedOrder.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Order Status</h3>
                <div className={styles.statusUpdateSection}>
                  <div className={styles.statusSelectWrapper}>
                    <select
                      value={selectedOrder.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(selectedOrder._id, e.target.value)
                      }
                      className={`${styles.statusSelect} ${
                        styles[selectedOrder.status || "pending"]
                      }`}
                      disabled={isUpdating}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="on hold">On Hold</option>
                    </select>
                    {isUpdating && (
                      <div className={styles.statusSpinner}>
                        <FaSpinner className={styles.spinner} />
                      </div>
                    )}
                  </div>
                  {updateError && (
                    <div className={styles.statusError}>{updateError}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
