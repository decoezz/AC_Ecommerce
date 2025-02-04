import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Cart.module.css";
import { motion } from "framer-motion";
import {
  FiTrash2,
  FiShoppingBag,
  FiArrowLeft,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { PaymentService } from "../services/PaymentService";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({
    phone: "",
    address: "",
  });
  const navigate = useNavigate();

  // Add retry delay utility
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Add retry logic for API calls
  const retryRequest = async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0 || error.response?.status !== 429) {
        throw error;
      }
      await wait(delay);
      return retryRequest(fn, retries - 1, delay * 2);
    }
  };

  const fetchProductDetails = async (productId) => {
    return retryRequest(async () => {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
      const response = await axios.get(`${apiUrl}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      return response.data.data;
    });
  };

  const fetchCart = async () => {
    return retryRequest(async () => {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
      const response = await axios.get(`${apiUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      return response;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const cartResponse = await fetchCart();
      console.log("Cart Response:", cartResponse.data);

      // Extract cart items
      let cartItems = [];
      if (cartResponse.data?.data?.Items) {
        cartItems = cartResponse.data.data.Items;
      } else if (cartResponse.data?.data?.cart?.Items) {
        cartItems = cartResponse.data.data.cart.Items;
      }

      // Ensure cartItems is an array
      if (!Array.isArray(cartItems)) {
        console.error("Cart items is not an array:", cartItems);
        cartItems = [];
      }

      // Process cart items
      const cartItemsProcessed = cartItems.map((item) => ({
        quantity: item.quantity,
        product: {
          _id: item.product?._id,
          name: item.product?.name,
          price: item.product?.price,
          image: item.product?.photos?.[0], // Use the first photo from the array
          description: item.product?.description,
          brand: item.product?.brand,
          modelNumber: item.product?.modelNumber,
          powerConsumption: item.product?.powerConsumption,
          coolingCapacity: item.product?.coolingCapacitiy, // Note the typo in the API
          starRating: item.product?.starRating,
          inStock: item.product?.inStock,
          quantityInStock: item.product?.quantityInStock,
        },
      }));

      console.log("Processed cart items:", cartItemsProcessed);
      setCartItems(cartItemsProcessed.filter((item) => item.product._id));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch cart items");
      }
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/cart`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setCartItems(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item to cart");
    }
  };

  // Update item quantity with user ID
  const updateQuantity = async (productId, quantity) => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
      await retryRequest(async () => {
        await axios.patch(
          `${apiUrl}/cart/${productId}`,
          { quantity },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
      });

      // Update local state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error("Update quantity error:", err);
      setError(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Remove item with user ID
  const removeItem = async (productId) => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
      await retryRequest(async () => {
        await axios.delete(`${apiUrl}/cart/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      });

      // Update local state
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product._id !== productId)
      );
    } catch (err) {
      console.error("Remove item error:", err);
      setError(err.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Clear cart with user ID
  const clearCart = async () => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
      await axios.delete(`${apiUrl}/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Clear local cart state
      setCartItems([]);
      setError(null);
    } catch (err) {
      console.error("Clear cart error:", err);
      setError(err.response?.data?.message || "Failed to clear cart");
    } finally {
      setUpdateLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.product?.price || 0);
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validate phone number (Egyptian format)
    if (!formData.phone.match(/^(\+201|01)\d{9}$/)) {
      errors.phone = "Please enter a valid Egyptian phone number";
    }

    // Validate address
    if (formData.address.trim().length < 10) {
      errors.address = "Please enter a complete address (min 10 characters)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to create an order");
        return;
      }

      const totalAmount = cartItems.reduce(
        (total, item) => total + item.quantity * item.product.price,
        0
      );

      const orderItems = cartItems.map((item) => ({
        ac: item.product._id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
        modelNumber: item.product.modelNumber,
      }));

      const orderPayload = {
        shippingAddress: formData.address,
        mobileNumber: formData.phone,
        items: orderItems,
        orderStatus: "on hold",
        totalAmount: totalAmount,
      };

      console.log("Sending order payload:", orderPayload);

      const baseURL = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${baseURL}/orders`, orderPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Order creation response:", response.data);

      if (
        response.data.status === "success" &&
        response.data.data?.order?._id
      ) {
        const orderId = response.data.data.order._id;

        try {
          // Get payment URL using PaymentService
          const paymentUrl = await PaymentService.initiatePaymobPayment(
            orderId,
            totalAmount,
            formData
          );

          // Store order reference
          localStorage.setItem("currentOrderId", orderId);

          // Redirect to payment page
          window.location.href = paymentUrl;
        } catch (paymentError) {
          console.error("Payment initiation error:", paymentError);
          toast.error("Failed to initiate payment. Please try again.");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => fetchData()} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <motion.div
        className={styles.cartContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.cartHeader}>
          <button onClick={() => navigate("/")} className={styles.backButton}>
            <FiArrowLeft className={styles.icon} />
            <span>Continue Shopping</span>
          </button>
          <div className={styles.cartTitle}>
            <h2>Your Cart</h2>
            <span className={styles.itemCount}>
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </span>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className={styles.clearCartButton}
              disabled={updateLoading}
            >
              <FiTrash2 className={styles.icon} />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {error && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <motion.div
                key={item.product._id}
                className={styles.cartItem}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className={styles.itemImage}>
                  <img
                    src={item.product.image}
                    alt={`${item.product.brand} ${item.product.modelNumber}`}
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemDetails}>
                    <h3>{`${item.product.brand} - ${item.product.modelNumber}`}</h3>
                    <div className={styles.itemSpecs}>
                      <span className={styles.specItem}>
                        <strong>Brand:</strong> {item.product.brand}
                      </span>
                      <span className={styles.specItem}>
                        <strong>Model:</strong> {item.product.modelNumber}
                      </span>
                      {item.product.powerConsumption && (
                        <span className={styles.specItem}>
                          <strong>Power:</strong>{" "}
                          {item.product.powerConsumption}W
                        </span>
                      )}
                      {item.product.coolingCapacity && (
                        <span className={styles.specItem}>
                          <strong>Cooling:</strong>{" "}
                          {item.product.coolingCapacity} BTU
                        </span>
                      )}
                      <span className={styles.specItem}>
                        <strong>Rating:</strong> {item.product.starRating} ★
                      </span>
                    </div>
                    <div className={styles.stockInfo}>
                      {item.product.quantityInStock > 0 ? (
                        <span className={styles.inStock}>
                          In Stock: {item.product.quantityInStock}
                        </span>
                      ) : (
                        <span className={styles.outOfStock}>Out of Stock</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemControls}>
                    <div className={styles.priceQuantity}>
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity - 1)
                          }
                          disabled={updateLoading || item.quantity <= 1}
                          className={styles.quantityButton}
                        >
                          −
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          disabled={
                            updateLoading ||
                            item.quantity >= item.product.quantityInStock
                          }
                          className={styles.quantityButton}
                        >
                          +
                        </button>
                      </div>
                      <div className={styles.priceInfo}>
                        <span className={styles.price}>
                          ${(item.product.price || 0).toFixed(2)}
                        </span>
                        <span className={styles.itemTotal}>
                          Total: $
                          {(item.quantity * (item.product.price || 0)).toFixed(
                            2
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className={styles.removeButton}
                      disabled={updateLoading}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>
                    $
                    {cartItems
                      .reduce(
                        (total, item) =>
                          total + item.quantity * (item.product.price || 0),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>
                    $
                    {cartItems
                      .reduce(
                        (total, item) =>
                          total + item.quantity * (item.product.price || 0),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              {!showCheckoutForm ? (
                <button
                  onClick={() => setShowCheckoutForm(true)}
                  className={styles.checkoutButton}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className={styles.checkoutForm}>
                  <h3>Order Details</h3>

                  {/* Contact Information */}
                  <div className={styles.formSection}>
                    <h4>Contact Information</h4>
                    <div className={styles.formGroup}>
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number (e.g., 01xxxxxxxxx)"
                        className={`${styles.input} ${
                          formErrors.phone ? styles.inputError : ""
                        }`}
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      {formErrors.phone && (
                        <span className={styles.errorText}>
                          {formErrors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className={styles.formSection}>
                    <h4>Shipping Address</h4>
                    <div className={styles.formGroup}>
                      <label>Complete Address</label>
                      <textarea
                        name="address"
                        placeholder="Enter your full shipping address"
                        className={`${styles.input} ${styles.textarea} ${
                          formErrors.address ? styles.inputError : ""
                        }`}
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                      />
                      {formErrors.address && (
                        <span className={styles.errorText}>
                          {formErrors.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className={styles.formSection}>
                    <h4>Order Items</h4>
                    <div className={styles.orderItemsList}>
                      {cartItems.map((item) => (
                        <div
                          key={item.product._id}
                          className={styles.orderItem}
                        >
                          <span className={styles.itemName}>
                            {item.product.brand} - {item.product.modelNumber}
                          </span>
                          <span className={styles.itemQuantity}>
                            x{item.quantity}
                          </span>
                          <span className={styles.itemPrice}>
                            ${(item.quantity * item.product.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handleCheckout}
                    className={styles.checkoutButton}
                    disabled={cartItems.length === 0}
                  >
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;
