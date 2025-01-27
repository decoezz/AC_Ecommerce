import React, { useState } from "react";
import axios from "axios";
import styles from "./CreateEmployee.module.css";

const CreateEmployee = () => {
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // State to manage button disable

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsSubmitting(true); // Disable the button

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            setIsSubmitting(false); // Re-enable the button
            return;
        }

        let retries = 3; // Number of retries
        let delay = 1000; // Initial delay in milliseconds

        while (retries > 0) {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/admin/signup`, {
                    name,
                    mobileNumber,
                    email,
                    password,
                    passwordConfirm,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setMessage('Employee account created successfully!');
                // Clear the form fields
                setName('');
                setMobileNumber('');
                setEmail('');
                setPassword('');
                setPasswordConfirm('');
                setIsSubmitting(false); // Re-enable the button
                return; // Exit the function after success
            } catch (err) {
                if (err.response && err.response.status === 429) {
                    // If we get a 429 error, wait and retry
                    retries -= 1;
                    if (retries === 0) {
                        setError('Too many requests. Please try again later.');
                    } else {
                        await new Promise(res => setTimeout(res, delay));
                        delay *= 2; // Exponential backoff
                    }
                } else {
                    setError(err.response?.data?.message || 'Failed to create employee account.');
                    setIsSubmitting(false); // Re-enable the button
                    return; // Exit on other errors
                }
            }
        }
        setIsSubmitting(false); // Re-enable the button if all retries fail
    };

    return (
        <div className={styles.createEmployee}>
            <h2>Create Employee Account</h2>
            <form onSubmit={handleCreateEmployee} className={styles.createEmployeeForm}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                />
                <button type="submit" disabled={isSubmitting}>Create Employee</button>
            </form>
            {message && <p className={styles.success}>{message}</p>}
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default CreateEmployee; 