import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Login.module.css'; // Ensure this CSS file is correctly linked

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
        <div className="login-container">
            <h2 className="login-title">Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-input-container">
                    <label className="login-label">Username:</label>
                    <input
                        className="login-input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="login-input-container">
                    <label className="login-label">Password:</label>
                    <input
                        className="login-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="login-button" type="submit">Login</button>
            </form>
            <p className="login-link">
                Don't have an account? <Link className="login-link-text" to="/create-account">Create one here</Link>
            </p>
        </div>
    );
};

export default Login; 
