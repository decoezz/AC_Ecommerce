import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AllUsers.module.css';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllUsers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("API Response:", response.data);
                setUsers(response.data.data.users);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch users.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllUsers();
    }, []);

    return (
        <div className={styles.allUsers}>
            <h2>All Users</h2>
            {loading && <p>Loading users...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {users.length === 0 && !loading && <p>No users found.</p>}
            <table className={styles.userTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile Number</th>
                        <th>Role</th>
                        <th>Address</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.map((user) => (
                        <tr key={user._id} className={styles.userRow}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.mobileNumber}</td>
                            <td>{user.role}</td>
                            <td>{user.address}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AllUsers; 