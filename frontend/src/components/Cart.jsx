import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Cart.module.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const apiUrl =
          import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
        const response = await axios.get(`${apiUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const userData = response.data.data;
        setPurchasedItems(
          Array.isArray(userData.purshacedAc) ? userData.purshacedAc : []
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err.response?.data?.message || "Failed to fetch purchase history"
        );
        setPurchasedItems([]);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.cart}>
        <div className={styles.cart__loading}>
          <div className={styles.loading__spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      <div className={styles.cart__header}>
        <h2 className={styles.cart__title}>Shopping Cart</h2>
      </div>

      {/* Cart Items Section */}
      <div className={styles.cart__content}>
        {cartItems.length === 0 ? (
          <div className={styles.cart__empty}>
            <p className={styles.cart__message}>
              Your shopping cart is currently empty.
            </p>
          </div>
        ) : (
          <div className={styles.cart__items}>
            {/* Cart items will be mapped here */}
          </div>
        )}
      </div>

      {/* Purchase History Section */}
      <div className={styles.orders__section}>
        <h3 className={styles.orders__title}>My Purchase History</h3>
        {error ? (
          <div className={styles.error__message}>
            <p>{error}</p>
          </div>
        ) : !Array.isArray(purchasedItems) || purchasedItems.length === 0 ? (
          <div className={styles.orders__empty}>
            <p>You haven't purchased any items yet.</p>
          </div>
        ) : (
          <div className={styles.orders__list}>
            {purchasedItems.map((order, orderIndex) => (
              <div key={order._id} className={styles.order__card}>
                <div className={styles.order__header}>
                  <span className={styles.order__id}>
                    Order #{orderIndex + 1} (ID: {order._id.slice(-6)})
                  </span>
                  <span className={styles.product__status}>Completed</span>
                </div>

                <div className={styles.order__details}>
                  <div className={styles.order__items}>
                    {order.items.map((item, itemIndex) => (
                      <div key={item._id} className={styles.order__item}>
                        <div className={styles.item__details}>
                          <h4>Item {itemIndex + 1}</h4>
                          <p>AC ID: {item.ac}</p>
                          <p>Model: {item.modelNumber}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${item.priceAtPurchase.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.order__summary}>
                    <p className={styles.order__total}>
                      Order Total: $
                      {order.items
                        .reduce(
                          (total, item) =>
                            total + item.priceAtPurchase * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </p>
                    <p className={styles.items__count}>
                      Total Items:{" "}
                      {order.items.reduce(
                        (count, item) => count + item.quantity,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
