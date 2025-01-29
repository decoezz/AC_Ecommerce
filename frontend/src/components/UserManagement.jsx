import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserPlus,
  FaSearch,
  FaTrash,
  FaSpinner,
  FaEdit,
  FaCheck,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserShield,
  FaFilter,
} from "react-icons/fa";
import styles from "./UserManagement.module.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    address: "",
    role: "Customer",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:4000/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(response.data.data) ? response.data.data : []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Failed to load users");
      setUsers([]);
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:4000/api/v1/users/register", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("User created successfully!");
      setShowCreateForm(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        mobileNumber: "",
        address: "",
        role: "Customer",
      });
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating user");
    }
    setIsLoading(false);
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:4000/api/v1/users/${userId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("User updated successfully!");
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:4000/api/v1/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("User deleted successfully!");
        fetchUsers();
      } catch (error) {
        setMessage(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === "All" || user.role === filterRole;
        return matchesSearch && matchesRole;
      })
    : [];

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>User Management</h1>
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className={styles.roleFilter}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
              <option value="Customer">Customer</option>
            </select>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              <FaUserPlus /> Add New User
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.loadingSpinner} />
            <p>Loading users...</p>
          </div>
        ) : (
          <div className={styles.userGrid}>
            {filteredUsers.map((user) => (
              <div key={user._id} className={styles.userCard}>
                <div className={styles.userHeader}>
                  <img
                    src={
                      user.profilePicture || "https://via.placeholder.com/150"
                    }
                    alt={user.name}
                    className={styles.userAvatar}
                  />
                  <div className={styles.userInfo}>
                    <h3>{user.name}</h3>
                    <span
                      className={`${styles.roleBadge} ${
                        styles[user.role.toLowerCase()]
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.detailItem}>
                    <FaEnvelope className={styles.detailIcon} />
                    <span>{user.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <FaPhone className={styles.detailIcon} />
                    <span>{user.mobileNumber}</span>
                  </div>
                  {user.address && (
                    <div className={styles.detailItem}>
                      <FaMapMarkerAlt className={styles.detailIcon} />
                      <span>{user.address}</span>
                    </div>
                  )}
                </div>
                <div className={styles.userActions}>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className={styles.editButton}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className={styles.formGroup}>
                <FaUser className={styles.formIcon} />
                <input
                  type="text"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                />
              </div>
              {/* Add other form fields similarly */}
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  <FaUserPlus /> Create User
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && (
        <div className={`${styles.message} ${styles.slideIn}`}>
          <p>{message}</p>
          <button onClick={() => setMessage("")}>
            <FaCheck />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
