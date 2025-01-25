import React from 'react';
import styles from "./Cart.module.css";

const Cart = () => (
    <div className={styles.cart}>
        <h2 className={styles.cart__title}>Cart</h2>
        <div className={styles.cart__content}>
            <p className={styles.cart__message}>Your shopping cart is currently empty.</p>
        </div>
    </div>
);

export default Cart;
