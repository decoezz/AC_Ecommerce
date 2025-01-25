import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import styles from "./Login.module.css";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Username:', username);
        console.log('Password:', password);
        // Reset fields after submission
        setUsername('');
        setPassword('');
    };

    return (
        <div className={styles.login}>
            <h2 className={styles.login__title}>Login</h2>
            <form className={styles.login__form} onSubmit={handleSubmit}>
                <div className={styles.login__inputContainer}>
                    <label className={styles.login__label}>Username:</label>
                    <input
                        className={styles.login__input}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.login__inputContainer}>
                    <label className={styles.login__label}>Password:</label>
                    <input
                        className={styles.login__input}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className={styles.login__button} type="submit">Login</button>
            </form>
            <p className={styles.login__link}>
                Don't have an account? <Link to="/create-account">Create one here</Link>
            </p>
        </div>
    );
};

export default Login; 
