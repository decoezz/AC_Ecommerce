import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

const Home = () => {
    return (
        <div className={styles.home}>
            <h2 className={styles.home__title}>Welcome to Our E-Commerce Site</h2>
            <div className={styles.home__content}>
                <p className={styles.home__description}>
                    Thank you for visiting our e-commerce site. Here are some quick links to get you started:
                </p>
                <ul className={styles.home__links}>
                    <li><Link to="/products">View Products</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default Home;

