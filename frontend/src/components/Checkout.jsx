import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Checkout.module.css";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This will be replaced with actual cart data
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Stripe integration will go here
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
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
          <h2>Billing Information</h2>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Full Name"
              className={styles.input}
            />
            <input
              type="email"
              placeholder="Email Address"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <input type="text" placeholder="Address" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <input type="text" placeholder="City" className={styles.input} />
            <input type="text" placeholder="State" className={styles.input} />
            <input
              type="text"
              placeholder="ZIP Code"
              className={styles.input}
            />
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
