import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./CreateOrder.module.css";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [retryAfter, setRetryAfter] = useState(0);
  const [orderData, setOrderData] = useState({
    shippingAddress: "",
    mobileNumber: "",
    orderStatus: "on hold",
    items: [
      { productId: "", modelNumber: "", quantity: 1, priceAtPurchase: 0 },
    ],
  });

  // Fetch products with rate limit handling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (retryAfter > 0) return;

        const token = localStorage.getItem("token");
        const baseURL = import.meta.env.VITE_API_URL;

        const response = await axios.get(`${baseURL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Products response:", response.data);

        // Extract products array from the nested structure
        const productData = response.data?.data?.products || [];
        console.log("Product data:", productData);

        // Less strict validation - only check if product exists
        const validProducts = productData.filter((product) => product);

        console.log("Valid products:", validProducts); // Debug log to see what products are considered valid

        setProducts(validProducts);

        if (validProducts.length === 0) {
          setError("No products available. Please try again later.");
        } else {
          setError(""); // Clear any existing error if products are found
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
        if (err.response?.status === 429) {
          const retrySeconds =
            parseInt(err.response.headers["retry-after"]) || 60;
          setRetryAfter(retrySeconds);
          setError(`Rate limit exceeded. Please wait ${retrySeconds} seconds.`);
        } else {
          setError("Failed to load products. Please refresh the page.");
        }
      }
    };

    fetchProducts();
  }, [retryAfter]);

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
      // Find product by model number
      const product = products.find((p) => p._id === value); // Changed to find by _id
      console.log("Selected product:", product); // Debug log

      if (product) {
        newItems[index] = {
          ...newItems[index],
          modelNumber: product.modelNumber || "",
          productId: product._id,
          priceAtPurchase: product.price || 0,
        };
        console.log("Updated item:", newItems[index]); // Debug log
      } else {
        newItems[index] = {
          ...newItems[index],
          modelNumber: "",
          productId: "",
          priceAtPurchase: 0,
        };
      }
    } else if (field === "quantity") {
      newItems[index] = {
        ...newItems[index],
        quantity: Math.max(1, parseInt(value) || 1),
      };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate the order
      if (!orderData.shippingAddress.trim()) {
        throw new Error("Please enter a shipping address");
      }
      if (!orderData.mobileNumber.trim()) {
        throw new Error("Please enter a mobile number");
      }

      // Validate items
      const invalidItems = orderData.items.some(
        (item) => !item.productId || item.quantity < 1
      );

      if (invalidItems) {
        throw new Error("Please select products and quantities for all items");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to create an order");
      }

      const baseURL = import.meta.env.VITE_API_URL;

      // Format the items array correctly
      const formattedItems = orderData.items.map((item) => ({
        ac: item.productId,
        quantity: parseInt(item.quantity),
        priceAtPurchase: parseFloat(item.priceAtPurchase),
      }));

      // Prepare the payload with correct order status
      const payload = {
        shippingAddress: orderData.shippingAddress.trim(),
        mobileNumber: orderData.mobileNumber.trim(),
        items: formattedItems,
        orderStatus: "on hold",
      };

      console.log("Sending payload:", payload); // Debug log

      const response = await axios.post(`${baseURL}/orders`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Order creation response:", response.data); // Debug log

      if (response.data && response.data.data) {
        navigate("/orders");
      } else {
        throw new Error("Failed to create order. Please try again.");
      }
    } catch (err) {
      console.error("Order creation error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createOrder}>
      <h2>Create New Order</h2>

      {error && <div className={styles.error}>{error}</div>}
      {retryAfter > 0 && (
        <div className={styles.retryTimer}>
          Please wait {retryAfter} seconds before trying again
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.orderForm}>
        <div className={styles.formGroup}>
          <label htmlFor="shippingAddress">Shipping Address *</label>
          <textarea
            id="shippingAddress"
            value={orderData.shippingAddress}
            onChange={(e) =>
              setOrderData({ ...orderData, shippingAddress: e.target.value })
            }
            required
            className={styles.textarea}
            placeholder="Enter shipping address"
          />
        </div>

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
            placeholder="Enter mobile number"
          />
        </div>

        <div className={styles.itemsSection}>
          <h3>
            Order Items{" "}
            {products.length > 0
              ? `(${products.length} products available)`
              : ""}
          </h3>
          {orderData.items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <div className={styles.formGroup}>
                <label>
                  Product * {products.length === 0 && "(Loading products...)"}
                </label>
                <select
                  value={item.productId} // Changed to use productId as value
                  onChange={(e) =>
                    handleItemChange(index, "modelNumber", e.target.value)
                  }
                  required
                  className={styles.input}
                  disabled={retryAfter > 0 || products.length === 0}
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id} // Use _id as value
                    >
                      {product.name || "Unnamed Product"} -{" "}
                      {product.modelNumber || "No Model"} ($
                      {product.price?.toFixed(2) || "0.00"})
                    </option>
                  ))}
                </select>
                {products.length === 0 && !error && (
                  <div className={styles.loadingText}>
                    Loading available products...
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Quantity *</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  min="1"
                  required
                  className={styles.input}
                  disabled={retryAfter > 0}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Price</label>
                <input
                  type="number"
                  value={item.priceAtPurchase}
                  readOnly
                  className={`${styles.input} ${styles.readOnly}`}
                />
              </div>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className={styles.removeButton}
                disabled={orderData.items.length === 1 || retryAfter > 0}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className={styles.addButton}
            disabled={retryAfter > 0}
          >
            Add Item
          </button>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || retryAfter > 0}
          >
            {loading ? "Creating Order..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
