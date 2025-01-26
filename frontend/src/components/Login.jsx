import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State for error handling

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            const response = await axios.post('http://127.0.0.1:4000/api/v1/users/login', {
                email,
                password,
            });
            console.log('Login successful:', response.data);

            // Reset fields after successful login
            setEmail('');
            setPassword('');

            // Redirect or perform additional actions here
        } catch (err) {
            console.error('Login failed:', err);
            setError(
                err.response?.data?.message || 'An error occurred during login. Please try again.'
            );
        }
    };

    return (
        <div className={styles.login}>
            <h2 className={styles.login__title}>Login</h2>
            <form className={styles.login__form} onSubmit={handleSubmit}>
                {error && <p className={styles.login__error}>{error}</p>}
                <div className={styles.login__inputContainer}>
                    <label className={styles.login__label}>Email:</label>
                    <input
                        className={styles.login__input}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <button className={styles.login__button} type="submit">
                    Login
                </button>
            </form>
            <p className={styles.login__link}>
                Don't have an account? <Link to="/create-account">Create one here</Link>
            </p>
        </div>
    );
};

export default Login;
