import React from "react";
import styles from "./Home.module.css";

const Home = () => {
    // Retrieve user data from local storage
    const userData = localStorage.getItem('user'); // Get the user data as a string
    const user = userData ? JSON.parse(userData) : null; // Parse only if userData is not null

    return (
        <div className={styles.home}>
            <h2 className={styles.home__title}>Home</h2>
            <div className={styles.home__content}>
                {user ? (
                    <h2>Hello, {user.name}!</h2> // Display user's name
                ) : (
                    <h2>Please log in to see your account details.</h2>
                )}
            </div>
        </div>
    );
};

export default Home;
