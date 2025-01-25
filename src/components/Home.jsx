import React from "react";
import styles from "./Home.module.css";

const Home = () => {
    return (
        <div className={styles.home}>
            <h2 className={styles.home__title}>Home</h2>
            <div className={styles.home__content}>
                <p className={styles.home__description}>
                    Welcome to our website! Explore our products and services.
                </p>
            </div>
        </div>
    );
};

export default Home;
