import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CreateAccount.module.css';

const CreateAccount = () => {
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateMobileNumber = (mobile) => /^[0-9]{10,15}$/.test(mobile);
    const getPasswordStrength = (password) => {
        if (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password)) {
            return 'Strong';
        } else if (password.length >= 8) {
            return 'Medium';
        }
        return 'Weak';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!validateMobileNumber(mobileNumber)) {
            setError('Mobile number should contain 10-15 digits.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsSubmitting(true);

        try {
            const apiUrl = `${import.meta.env.VITE_API_URL}/users/signup`;
            console.log('API URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    mobileNumber,
                    email,
                    password,
                    passwordConfirm: confirmPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'An error occurred. Please try again.');
            }

            const data = await response.json();
            console.log('Account created successfully:', data);

            setSuccess('Account created successfully! You can now log in.');
            setName('');
            setMobileNumber('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Error creating account:', err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
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

