import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './CreateAccount.module.css';

const CreateAccount = () => {
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:4000/api/v1/users/signup', {
                name,
                mobileNumber,
                email,
                password,
                passwordConfirm: confirmPassword,
            });
            console.log('Account created successfully:', response.data);

            setSuccess('Account created successfully! You can now log in.');
            setName('');
            setMobileNumber('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Error creating account:', err);
            setError(
                err.response?.data?.message || 'An error occurred. Please try again.'
            );
        }
    };

    return (
        <div className={styles.createAccount}>
            <h2 className={styles.createAccount__title}>Create Account</h2>
            <form onSubmit={handleSubmit} className={styles.createAccount__form}>
                {error && <p className={styles.createAccount__error}>{error}</p>}
                {success && <p className={styles.createAccount__success}>{success}</p>}
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={styles.createAccount__input}
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Mobile Number:</label>
                    <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        className={styles.createAccount__input}
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.createAccount__input}
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.createAccount__input}
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={styles.createAccount__input}
                    />
                </div>
                <button type="submit" className={styles.createAccount__button}>
                    Create Account
                </button>
            </form>
            <p className={styles.createAccount__link}>
                Already have an account? <Link to="/">Login here</Link>
            </p>
        </div>
    );
};

export default CreateAccount;
