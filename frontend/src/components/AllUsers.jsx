import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AllUsers.module.css';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllUsers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch users.');
            }
        };

        fetchAllUsers();
    }, []);

    return (
        <div className={styles.allUsers}>
            <h2>All Users</h2>
            {error && <p className={styles.error}>{error}</p>}
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.name} - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllUsers; 