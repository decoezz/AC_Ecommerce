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

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [userId, setUserId] = useState(null);
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
      const token = localStorage.getItem("token");
      if (!token || !userId) {
        navigate("/login");
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
      await axios.delete(`${apiUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: { userId },
      });

      setCartItems([]);
    } catch (err) {
      console.error("Clear cart error:", err);
      setError(err.response?.data?.message || "Failed to clear cart");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.product?.price || 0);
    }, 0);
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
    <motion.div
      className={styles.cartContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.cartHeader}>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          <FiArrowLeft /> Continue Shopping
        </button>
        <h1>Your Cart</h1>
        <div className={styles.cartSummary}>
          <FiShoppingBag /> {cartItems.length} items
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <FiShoppingBag size={48} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => navigate("/")}
            className={styles.shopNowButton}
          >
            Start Shopping
          </button>
        </div>
      ) : (
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
                <div className={styles.itemDetails}>
                  <h3>{`${item.product.brand} - ${item.product.modelNumber}`}</h3>
                  <div className={styles.itemSpecs}>
                    <span>Brand: {item.product.brand}</span>
                    <span>Model: {item.product.modelNumber}</span>
                    {item.product.powerConsumption && (
                      <span>Power: {item.product.powerConsumption}W</span>
                    )}
                    {item.product.coolingCapacity && (
                      <span>
                        Cooling Capacity: {item.product.coolingCapacity} BTU
                      </span>
                    )}
                    <span>Rating: {item.product.starRating} ★</span>
                    {item.product.quantityInStock > 0 ? (
                      <span className={styles.inStock}>
                        In Stock: {item.product.quantityInStock}
                      </span>
                    ) : (
                      <span className={styles.outOfStock}>Out of Stock</span>
                    )}
                  </div>
                  <div className={styles.itemPrice}>
                    <span className={styles.currentPrice}>
                      ${(item.product.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                      disabled={updateLoading || item.quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                      disabled={
                        updateLoading ||
                        item.quantity >= item.product.quantityInStock
                      }
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className={styles.removeButton}
                    disabled={updateLoading}
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <div className={styles.itemTotal}>
                  <p>Total:</p>
                  <span>
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={styles.cartSummaryBox}>
            <h2>Order Summary</h2>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className={styles.checkoutButton}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Cart;
