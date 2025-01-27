import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CreateAccount.module.css';

const CreateAccount = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/signup`, {
                name,
                email,
                mobileNumber,
                password,
                passwordConfirm,
            });
            localStorage.setItem('user', JSON.stringify(response.data.data));
            localStorage.setItem('token', response.data.token);
            setName('');
            setEmail('');
            setMobileNumber('');
            setPassword('');
            setPasswordConfirm('');
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during signup. Please try again.');
        }
    };

    return (
        <div className={styles.createAccount}>
            <h2 className={styles.createAccount__title}>Create Account</h2>
            <form className={styles.createAccount__form} onSubmit={handleSubmit}>
                {error && <p className={styles.createAccount__error}>{error}</p>}
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Name:</label>
                    <input
                        className={styles.createAccount__input}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Email:</label>
                    <input
                        className={styles.createAccount__input}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Mobile Number:</label>
                    <input
                        className={styles.createAccount__input}
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Password:</label>
                    <input
                        className={styles.createAccount__input}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Confirm Password:</label>
                    <input
                        className={styles.createAccount__input}
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                    />
                </div>
                <button className={styles.createAccount__button} type="submit">Create Account</button>
            </form>
            <p className={styles.createAccount__link}>
                Already have an account? <Link to="/">Login here</Link>
            </p>
        </div>
    );
};

export default CreateAccount;

