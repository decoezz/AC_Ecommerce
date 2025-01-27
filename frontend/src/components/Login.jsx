import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Step 1: Log in the user
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, {
                email,
                password,
            });
            const token = response.data.token;
            localStorage.setItem('token', token); // Store the token

            // Step 2: Fetch the current user data to get the role
            const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const user = userResponse.data.data.user; // Access the user object correctly
            localStorage.setItem('user', JSON.stringify(user)); // Store user data

            // Log the user role for debugging
            console.log("User Role:", user.role);

            // Step 3: Redirect based on user role
            switch (user.role) {
                case 'admin':
                    navigate('/admin-home');
                    break;
                case 'employee':
                    navigate('/employee-home');
                    break;
                case 'user':
                    navigate('/user-home');
                    break;
                default:
                    navigate('/'); // Redirect to home or login if role is unknown
                    break;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login. Please try again.');
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
                <button className={styles.login__button} type="submit">Login</button>
            </form>
            <p className={styles.login__link}>
                Don't have an account? <Link to="/create-account">Create one here</Link>
            </p>
        </div>
    );
};

export default Login;
