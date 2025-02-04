import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Checkout.module.css";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({
    phone: "",
    address: "",
  });

  // This will be replaced with actual cart data
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderId = localStorage.getItem("currentOrderId");
      console.log("Fetching order details for ID:", orderId);

      if (!orderId) {
        console.log("No order ID found, redirecting to cart");
        navigate("/cart");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const baseURL = import.meta.env.VITE_API_URL;
        console.log("Making request to:", `${baseURL}/orders/${orderId}`);

        // Try to get order details
        const response = await axios.get(`${baseURL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Order details response:", response.data);

        // Check if we have the order data in the expected format
        if (response.data.status === "success" && response.data.data?.order) {
          const order = response.data.data.order;
          setOrderData(order);

          // Calculate totals from order data
          const subtotal = order.totalAmount || 0;
          setOrderSummary({
            subtotal: subtotal,
            shipping: 0,
            tax: 0,
            total: subtotal,
          });
        } else {
          // If response format is unexpected, throw error
          throw new Error("Invalid order data format");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
        }

        // Handle specific error cases
        if (error.response?.status === 404) {
          toast.error("Order not found. Returning to cart...");
          localStorage.removeItem("currentOrderId");
          navigate("/cart");
        } else {
          setError("Failed to load order details. Please try again.");
          toast.error("Error loading order details");
        }
      }
    };

    // Add a small delay to ensure the order is saved in the database
    const timer = setTimeout(() => {
      fetchOrderDetails();
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

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

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderId = localStorage.getItem("currentOrderId");
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;

      // Update order with shipping details
      await axios.patch(
        `${baseURL}/orders/${orderId}`,
        {
          shippingAddress: formData.address,
          mobileNumber: formData.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear the current order ID
      localStorage.removeItem("currentOrderId");

      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      toast.error(
        err.response?.data?.message || "Failed to update order details"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutHeader}>
        <button onClick={() => navigate("/cart")} className={styles.backButton}>
          <FiArrowLeft className={styles.icon} />
          <span>Back to Cart</span>
        </button>
        <h1>Checkout</h1>
      </div>

      <div className={styles.checkoutContent}>
        <div className={styles.billingSection}>
          <h2>Contact Information</h2>
          <div className={styles.formGroup}>
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
              <span className={styles.errorText}>{formErrors.phone}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="address"
              placeholder="Shipping Address"
              className={`${styles.input} ${
                formErrors.address ? styles.inputError : ""
              }`}
              value={formData.address}
              onChange={handleInputChange}
            />
            {formErrors.address && (
              <span className={styles.errorText}>{formErrors.address}</span>
            )}
          </div>
        </div>

        <div className={styles.paymentSection}>
          <h2>Payment Details</h2>
          <div className={styles.stripeElement}>
            {/* Stripe Elements will be mounted here */}
            <div className={styles.cardElement}>
              Credit Card details will be collected securely by Stripe
            </div>
          </div>
        </div>

        <div className={styles.orderSummary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${orderSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>${orderSummary.shipping.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax</span>
              <span>${orderSummary.tax.toFixed(2)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>${orderSummary.total.toFixed(2)}</span>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.paymentButton}
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.loading}>Processing...</span>
            ) : (
              <>
                <FiShoppingBag className={styles.icon} />
                Pay Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
