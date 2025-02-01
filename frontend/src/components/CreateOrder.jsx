import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./CreateOrder.module.css";
import {
  FaStore,
  FaShoppingCart,
  FaPlus,
  FaTrash,
  FaMinus,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [orderType, setOrderType] = useState(""); // "online" or "store"
  const [retryAfter, setRetryAfter] = useState(0);
  const [orderData, setOrderData] = useState({
    shippingAddress: "",
    mobileNumber: "",
    orderStatus: "on hold",
    items: [
      { productId: "", modelNumber: "", quantity: 1, priceAtPurchase: 0 },
    ],
  });

  // Check if user is employee or admin
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        // Get user data from localStorage
        const userStr = localStorage.getItem("user");
        const tokenStr = localStorage.getItem("token");

        console.log("Raw user data:", userStr);

        if (!userStr || !tokenStr) {
          console.log("Missing user data or token");
          setIsAuthorized(false);
          return;
        }

        // Parse user data
        let userData;
        try {
          userData = JSON.parse(userStr);
        } catch (e) {
          console.error("Failed to parse user data:", e);
          setIsAuthorized(false);
          return;
        }

        // Get user role, handling different data structures
        const user = userData.data?.user || userData.user || userData;
        const role = user?.role?.toLowerCase(); // Convert role to lowercase

        console.log("Parsed user role:", role);

        // Check if user is authorized (case-insensitive)
        const isAuth =
          role === "admin" ||
          role === "employee" ||
          role === "Admin" ||
          role === "Employee";
        console.log("Authorization result:", isAuth);

        setIsAuthorized(isAuth);
      } catch (error) {
        console.error("Authorization check failed:", error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, []);

  // Add this useEffect to log when authorization state changes
  useEffect(() => {
    console.log("Authorization state updated:", isAuthorized);
  }, [isAuthorized]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseURL = import.meta.env.VITE_API_URL;

        const response = await axios.get(`${baseURL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProducts(response.data.data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      }
    };

    fetchProducts();
  }, []);

  // Handle order type selection
  const handleOrderTypeSelect = (type) => {
    console.log("Selected order type:", type); // Debug log
    setOrderType(type);
    setOrderData({
      shippingAddress: "",
      mobileNumber: "",
      orderStatus: type === "store" ? "completed" : "on hold",
      items: [
        { productId: "", modelNumber: "", quantity: 1, priceAtPurchase: 0 },
      ],
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to create an order");

      const baseURL = import.meta.env.VITE_API_URL;

      // Format items for API
      const formattedItems = orderData.items.map((item) => ({
        ac: item.productId,
        quantity: parseInt(item.quantity),
        priceAtPurchase: parseFloat(item.priceAtPurchase),
      }));

      const payload = {
        shippingAddress: orderData.shippingAddress.trim(),
        mobileNumber: orderData.mobileNumber.trim(),
        items: formattedItems,
      };

      // Choose endpoint based on order type
      const endpoint =
        orderType === "store"
          ? `${baseURL}/orders/sellEmployee`
          : `${baseURL}/orders`;

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "success") {
        // Show success message
        toast.success(
          orderType === "store"
            ? "Store sale completed successfully!"
            : "Online order created successfully!",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        // Reset form and order type
        setOrderType("");
        setOrderData({
          shippingAddress: "",
          mobileNumber: "",
          orderStatus: "on hold",
          items: [
            { productId: "", modelNumber: "", quantity: 1, priceAtPurchase: 0 },
          ],
        });
      }
    } catch (err) {
      console.error("Order creation error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create order";

      // Show error message
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch store orders
  const fetchStoreOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${baseURL}/orders/SoldInShop`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle store orders if needed
      console.log("Store orders:", response.data);
    } catch (err) {
      console.error("Error fetching store orders:", err);
    }
  };

  // Display countdown timer
  useEffect(() => {
    if (retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];

    if (field === "modelNumber") {
      // Find product by ID
      const product = products.find((p) => p._id === value);

      if (product) {
        newItems[index] = {
          ...newItems[index],
          modelNumber: product.modelNumber || "",
          productId: product._id,
          priceAtPurchase: product.price || 0,
        };
      } else {
        newItems[index] = {
          ...newItems[index],
          modelNumber: "",
          productId: "",
          priceAtPurchase: 0,
        };
      }
    } else if (field === "quantity") {
      // Convert input to number and ensure it's positive
      const quantity = parseInt(value);
      if (!isNaN(quantity) && quantity > 0) {
        newItems[index] = {
          ...newItems[index],
          quantity: quantity,
        };
      }
    }

    setOrderData({ ...orderData, items: newItems });
  };

  const addItem = () => {
    setOrderData({
      ...orderData,
      items: [
        ...orderData.items,
        { productId: "", modelNumber: "", quantity: 1, priceAtPurchase: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    if (orderData.items.length === 1) {
      setError("Order must have at least one item");
      return;
    }
    const newItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({ ...orderData, items: newItems });
  };

  const validateOrder = () => {
    if (!orderData.shippingAddress.trim()) {
      throw new Error("Please enter a shipping address");
    }
    if (!orderData.mobileNumber.trim()) {
      throw new Error("Please enter a mobile number");
    }

    // Validate each item
    orderData.items.forEach((item, index) => {
      if (!item.modelNumber.trim()) {
        throw new Error(`Please enter a model number for item ${index + 1}`);
      }
      const product = products.find((p) => p.modelNumber === item.modelNumber);
      if (!product) {
        throw new Error(`Invalid model number for item ${index + 1}`);
      }
      if (!item.productId) {
        throw new Error(
          `Product not found for model number ${item.modelNumber}`
        );
      }
      if (item.quantity < 1) {
        throw new Error(`Please enter a valid quantity for item ${index + 1}`);
      }
    });
  };

  // Calculate total price
  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      return total + item.quantity * item.priceAtPurchase;
    }, 0);
  };

  const handleQuantityChange = (index, change) => {
    const newItems = [...orderData.items];
    const newQuantity = newItems[index].quantity + change;

    // Ensure quantity doesn't go below 1
    if (newQuantity >= 1) {
      newItems[index] = {
        ...newItems[index],
        quantity: newQuantity,
      };
      setOrderData({ ...orderData, items: newItems });
    }
  };

  return (
    <div className={styles.createOrder}>
      <ToastContainer />
      <h2>Create New Order</h2>

      {/* Debug information */}
      <div className={styles.debug}>
        <p>
          Authorization Status: {isAuthorized ? "Authorized" : "Not Authorized"}
        </p>
        <p>
          User Role:{" "}
          {(() => {
            try {
              const userData = JSON.parse(localStorage.getItem("user"));
              const user = userData.data?.user || userData.user || userData;
              return user?.role || "No role found";
            } catch (e) {
              return "Error getting role";
            }
          })()}
        </p>
      </div>

      {/* Order Type Selection */}
      {!orderType && (
        <div className={styles.orderTypeSelection}>
          <h3>Select Order Type</h3>
          <div className={styles.orderTypeButtons}>
            <button
              className={styles.orderTypeButton}
              onClick={() => handleOrderTypeSelect("online")}
            >
              <FaShoppingCart className={styles.orderTypeIcon} />
              <span>Online Order</span>
              <p>Create a new online order for delivery</p>
            </button>

            {isAuthorized ? (
              <button
                className={styles.orderTypeButton}
                onClick={() => handleOrderTypeSelect("store")}
              >
                <FaStore className={styles.orderTypeIcon} />
                <span>Store Sale</span>
                <p>Record an in-store purchase</p>
              </button>
            ) : (
              <div className={styles.unauthorizedMessage}>
                <FaStore className={styles.orderTypeIcon} />
                <span>Store Sale</span>
                <p>Only available to store employees and administrators</p>
              </div>
            )}
          </div>
        </div>
      )}

      {orderType && (
        <div className={styles.orderForm}>
          <div className={styles.orderTypeHeader}>
            <div className={styles.orderTypeInfo}>
              <span className={styles.orderTypeIcon}>
                {orderType === "store" ? <FaStore /> : <FaShoppingCart />}
              </span>
              <h3>{orderType === "store" ? "Store Sale" : "Online Order"}</h3>
            </div>
            <button
              className={styles.changeTypeButton}
              onClick={() => setOrderType("")}
            >
              Change Order Type
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h4>Customer Information</h4>
              <div className={styles.formGroup}>
                <label htmlFor="mobileNumber">Mobile Number *</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  value={orderData.mobileNumber}
                  onChange={(e) =>
                    setOrderData({ ...orderData, mobileNumber: e.target.value })
                  }
                  required
                  className={styles.input}
                  placeholder="Enter customer's mobile number"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="shippingAddress">
                  {orderType === "store"
                    ? "Customer Address"
                    : "Shipping Address"}{" "}
                  *
                </label>
                <textarea
                  id="shippingAddress"
                  value={orderData.shippingAddress}
                  onChange={(e) =>
                    setOrderData({
                      ...orderData,
                      shippingAddress: e.target.value,
                    })
                  }
                  required
                  className={styles.textarea}
                  placeholder={`Enter ${
                    orderType === "store" ? "customer's" : "shipping"
                  } address`}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h4>Order Items</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className={styles.addItemButton}
                >
                  <FaPlus /> Add Item
                </button>
              </div>

              {orderData.items.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.itemDetails}>
                    <div className={styles.formGroup}>
                      <label>Product *</label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          handleItemChange(index, "modelNumber", e.target.value)
                        }
                        required
                        className={styles.select}
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} - {product.modelNumber} ($
                            {product.price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Quantity *</label>
                      <div className={styles.quantityControl}>
                        <button
                          type="button"
                          className={`${styles.quantityButton} ${styles.minusButton}`}
                          onClick={() => handleQuantityChange(index, -1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className={styles.quantityDisplay}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className={`${styles.quantityButton} ${styles.plusButton}`}
                          onClick={() => handleQuantityChange(index, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className={styles.itemPrice}>
                      ${(item.quantity * item.priceAtPurchase).toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className={styles.removeItemButton}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              <div className={styles.orderTotal}>
                <span>Total Amount:</span>
                <span className={styles.totalPrice}>
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : orderType === "store"
                  ? "Complete Sale"
                  : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
