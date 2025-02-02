import React, { useState, useEffect, useCallback } from "react";
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
  FaCamera,
  FaUserTie,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaExclamationTriangle,
  FaLock,
  FaTimes,
} from "react-icons/fa";
import styles from "./UserManagement.module.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    passwordConfirm: "",
    role: "Employee",
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterRole] = useState("Employee");
  const [requestInProgress, setRequestInProgress] = useState(false);
  const THROTTLE_DELAY = 5000; // 5 seconds between requests
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Add default avatar as base64 string
  const defaultAvatar =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNWU3ZWIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyMCIgZmlsbD0iI2ExYTFhYSIvPjxwYXRoIGQ9Ik0xNSw4NWMwLTI1LDEwLTM1LDM1LTM1czM1LDEwLDM1LDM1IiBmaWxsPSIjYTFhMWFhIi8+PC9zdmc+";

  const fetchUsers = useCallback(
    async (isManualRefresh = false) => {
      if (isRefreshing) return;

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.data?.users) {
          const fetchedUsers = response.data.data.users;
          setAllUsers(fetchedUsers);
          setFilteredUsers(fetchedUsers);
          setTotalPages(Math.ceil(fetchedUsers.length / limit));
          setError("");
        } else {
          setAllUsers([]);
          setFilteredUsers([]);
          setError("No users found");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || "Failed to load users");
        setAllUsers([]);
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [limit, isRefreshing]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const handleManualRefresh = () => {
    fetchUsers(true);
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredUsers(allUsers);
      setTotalPages(Math.ceil(allUsers.length / limit));
      return;
    }

    const filtered = allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        user.mobileNumber.includes(searchValue) ||
        user.role.toLowerCase().includes(searchValue)
    );

    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / limit));
    setPage(1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      if (newEmployee.password !== newEmployee.passwordConfirm) {
        throw new Error("Passwords do not match");
      }

      // First, create the employee
      const employeeData = {
        name: newEmployee.name,
        email: newEmployee.email,
        mobileNumber: newEmployee.mobileNumber,
        password: newEmployee.password,
        passwordConfirm: newEmployee.passwordConfirm,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/admin/signup`,
        employeeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If employee creation was successful and we have a profile picture
      if (response.data.status === "success" && selectedFile) {
        const formData = new FormData();
        formData.append("profilePicture", selectedFile);

        // Upload the profile picture
        await axios.put(
          `${import.meta.env.VITE_API_URL}/users/upload-photo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${response.data.token}`, // Use the new user's token
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setMessage("Employee created successfully");
      setShowCreateForm(false);
      resetForm();
      fetchUsers(); // Refresh the users list
    } catch (err) {
      console.error("Error creating employee:", err);
      setError(err.response?.data?.message || "Failed to create employee");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewEmployee({
      name: "",
      email: "",
      mobileNumber: "",
      password: "",
      passwordConfirm: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/${userToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(users.filter((user) => user._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      setMessage("User deleted successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderUserRow = (user) => (
    <tr key={user._id}>
      <td>
        <div className={styles.userCell}>
          <img
            src={user.profilePicture || defaultAvatar}
            alt={user.name}
            className={styles.userAvatar}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
          <span>{user.name}</span>
        </div>
      </td>
      <td>{user.email}</td>
      <td>{user.mobileNumber}</td>
      <td>
        <span
          className={`${styles.roleTag} ${styles[user.role.toLowerCase()]}`}
        >
          {user.role}
        </span>
      </td>
      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <button
          className={styles.deleteButton}
          onClick={() => handleDeleteClick(user)}
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );

  const getPaginatedUsers = () => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredUsers.slice(startIndex, endIndex);
  };

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>
            <FaUserTie /> Employee Management
          </h1>
          <div className={styles.searchFilters}>
            <div className={styles.searchBar}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button
              className={styles.refreshButton}
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <FaSync className={isRefreshing ? styles.spinning : ""} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateForm(true)}
          >
            <FaUserPlus /> Create Employee
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => fetchUsers(true)}>Retry</button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.imageColumn}>Image</th>
                  <th
                    onClick={() => handleSort("name")}
                    className={sortField === "name" ? styles.activeSort : ""}
                  >
                    Name {getSortIcon("name")}
                  </th>
                  <th
                    onClick={() => handleSort("email")}
                    className={sortField === "email" ? styles.activeSort : ""}
                  >
                    Email {getSortIcon("email")}
                  </th>
                  <th
                    onClick={() => handleSort("mobileNumber")}
                    className={
                      sortField === "mobileNumber" ? styles.activeSort : ""
                    }
                  >
                    Mobile Number {getSortIcon("mobileNumber")}
                  </th>
                  <th
                    onClick={() => handleSort("role")}
                    className={sortField === "role" ? styles.activeSort : ""}
                  >
                    Role {getSortIcon("role")}
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className={
                      sortField === "createdAt" ? styles.activeSort : ""
                    }
                  >
                    Created At {getSortIcon("createdAt")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers
                  .sort((a, b) => {
                    if (sortOrder === "asc") {
                      return a[sortField] > b[sortField] ? 1 : -1;
                    } else {
                      return a[sortField] < b[sortField] ? 1 : -1;
                    }
                  })
                  .slice((page - 1) * limit, page * limit)
                  .map((user) => (
                    <tr key={user._id}>
                      <td className={styles.imageColumn}>
                        <div className={styles.avatarContainer}>
                          <img
                            src={user.profilePicture || defaultAvatar}
                            alt={`${user.name}'s avatar`}
                            className={styles.userAvatar}
                            onError={(e) => {
                              e.target.src = defaultAvatar;
                            }}
                          />
                        </div>
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.mobileNumber}</td>
                      <td>
                        <span
                          className={`${styles.roleBadge} ${
                            styles[user.role.toLowerCase()]
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className={styles.createModal}>
          <div className={styles.createModalContent}>
            <div className={styles.createModalHeader}>
              <h2>Create New Employee</h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className={styles.createForm}>
              <div className={styles.profilePictureUpload}>
                <img
                  src={previewUrl || defaultAvatar}
                  alt="Profile Preview"
                  className={styles.avatarPreview}
                />
                <label className={styles.cameraButton}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  <FaCamera className={styles.cameraIcon} />
                </label>
              </div>

              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={newEmployee.mobileNumber}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      mobileNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={newEmployee.passwordConfirm}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      passwordConfirm: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalContent}>
              <FaExclamationTriangle className={styles.warningIcon} />
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete user{" "}
                <strong>{userToDelete?.name}</strong>?
              </p>
              <p className={styles.warningText}>
                This action cannot be undone.
              </p>

              <div className={styles.deleteModalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className={styles.spinner} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(message || error) && (
        <div
          className={`${styles.message} ${
            error ? styles.error : styles.success
          }`}
        >
          <p>{message || error}</p>
          <button
            onClick={() => {
              setMessage("");
              setError("");
            }}
          >
            <FaCheck />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
