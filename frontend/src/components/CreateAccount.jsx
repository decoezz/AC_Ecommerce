import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import styles from "./CreateAccount.module.css";

const CreateAccount = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle account creation logic here
        console.log('Creating account for:', firstName, lastName, email);
        // Reset fields after submission
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className={styles.createAccount}>
            <h2 className={styles.createAccount__title}>Create Account</h2>
            <form onSubmit={handleSubmit} className={styles.createAccount__form}>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>First Name:</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className={styles.createAccount__input}
                    />
                </div>
                <div className={styles.createAccount__inputContainer}>
                    <label className={styles.createAccount__label}>Last Name:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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
                <button type="submit" className={styles.createAccount__button}>Create Account</button>
            </form>
            <p className={styles.createAccount__link}>
                Already have an account? <Link to="/">Login here</Link>
            </p>
        </div>
    );
};

export default CreateAccount; 
