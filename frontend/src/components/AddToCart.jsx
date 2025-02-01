import React, { useState } from "react";
import axios from "axios";
import styles from "./AddToCart.module.css";

const AddToCart = ({ productId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to add items to cart");
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
      await axios.post(
        `${apiUrl}/cart`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // Show success feedback
      alert("Item added to cart successfully!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err.response?.data?.message || "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.addToCart}>
      <div className={styles.quantityControl}>
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          disabled={quantity <= 1 || loading}
          className={styles.quantityBtn}
        >
          -
        </button>
        <span className={styles.quantity}>{quantity}</span>
        <button
          onClick={() => setQuantity((prev) => prev + 1)}
          disabled={loading}
          className={styles.quantityBtn}
        >
          +
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading}
        className={`${styles.addButton} ${loading ? styles.loading : ""}`}
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default AddToCart;
