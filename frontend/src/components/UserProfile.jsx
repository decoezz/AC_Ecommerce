import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./UserProfile.module.css";
import RoleOptionsModal from "./RoleOptionsModal";
import { FaCamera, FaEdit, FaKey } from "react-icons/fa";

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      // Handle both data structures: {user: {...}} and {...}
      return parsed.user || parsed;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState("");

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // First check if we have valid cached data
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        const userData = parsed.user || parsed;
        if (userData && userData.email) {
          setUserProfile(userData);
          setLoading(false);
        }
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";

      const response = await fetch(`${apiUrl}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        const errorData = await response.json();
        // If it's the specific "select is not a function" error, we'll continue with cached data
        if (errorData.message?.includes("select is not a function")) {
          if (userProfile) {
            setError("Unable to refresh profile data. Using cached version.");
            return;
          }
        }
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      // Handle different response structures
      const userData = data.data?.user || data.user || data.data || data;

      if (userData && userData.email) {
        setUserProfile(userData);
        localStorage.setItem("user", JSON.stringify({ user: userData }));
        setError(null);
      } else {
        throw new Error("Invalid user data format");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);

      // If we already have userProfile data, show a less severe error
      if (userProfile) {
        setError("Unable to refresh profile. Using cached data.");
      } else {
        setError("Failed to load profile. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // Refresh every 5 minutes, but only if we don't have an error
    const interval = setInterval(() => {
      if (!error) {
        fetchUserProfile();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [error]);

  const handleProfileClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      handleUpload(file); // Automatically upload when file is selected
    }
  };

  const handleUpload = async (file) => {
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";
      const response = await axios.put(
        `${apiUrl}/users/upload-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("Profile picture uploaded successfully!");
      // Refresh user profile after successful upload
      fetchUserProfile();
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message || "Failed to upload profile picture."
      );
    }
  };

  if (loading && !userProfile) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (!userProfile) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error || "No profile data available"}</p>
        <button onClick={fetchUserProfile} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  const avatarLetter = userProfile.name?.charAt(0) || "?";

  return (
    <div className={styles.userProfile}>
      <div className={styles.userProfile__container}>
        <div className={styles.userProfile__header}>
          <div className={styles.userProfile__avatarContainer}>
            <div className={styles.userProfile__avatar}>
              {userProfile.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt="Profile"
                  className={styles.userProfile__avatarImage}
                />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <label
              className={styles.userProfile__uploadButton}
              title="Upload Photo"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.userProfile__fileInput}
              />
              <FaCamera className={styles.userProfile__cameraIcon} />
            </label>
          </div>
          <div className={styles.userProfile__headerInfo}>
            <div className={styles.userProfile__nameContainer}>
              <h1 className={styles.userProfile__name}>{userProfile.name}</h1>
              <button
                className={styles.userProfile__iconButton}
                title="Edit Profile"
              >
                <FaEdit />
              </button>
            </div>
            <div className={styles.userProfile__email}>{userProfile.email}</div>
            <div className={styles.userProfile__role}>{userProfile.role}</div>
          </div>
          <div className={styles.userProfile__headerActions}>
            <button
              onClick={handleLogout}
              className={styles.userProfile__logoutButton}
            >
              Logout
            </button>
          </div>
        </div>

        <div className={styles.userProfile__section}>
          <div className={styles.userProfile__sectionHeader}>
            <h2 className={styles.userProfile__sectionTitle}>
              Personal Information
            </h2>
            <button
              className={styles.userProfile__passwordButton}
              title="Change Password"
            >
              <FaKey /> Change Password
            </button>
          </div>
          <div className={styles.userProfile__grid}>
            <div className={styles.userProfile__field}>
              <div className={styles.userProfile__fieldLabel}>Name</div>
              <div className={styles.userProfile__fieldValue}>
                {userProfile.name || "-"}
              </div>
            </div>
            <div className={styles.userProfile__field}>
              <div className={styles.userProfile__fieldLabel}>
                Mobile Number
              </div>
              <div className={styles.userProfile__fieldValue}>
                {userProfile.mobileNumber || "-"}
              </div>
            </div>
            <div className={styles.userProfile__field}>
              <div className={styles.userProfile__fieldLabel}>Email</div>
              <div className={styles.userProfile__fieldValue}>
                {userProfile.email || "-"}
              </div>
            </div>
            <div className={styles.userProfile__field}>
              <div className={styles.userProfile__fieldLabel}>Address</div>
              <div className={styles.userProfile__fieldValue}>
                {userProfile.address || "-"}
              </div>
            </div>
            <div className={styles.userProfile__field}>
              <div className={styles.userProfile__fieldLabel}>Role</div>
              <div className={styles.userProfile__fieldValue}>
                {userProfile.role || "-"}
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className={styles.warningBanner}>
            {error}
            <button onClick={fetchUserProfile} className={styles.refreshButton}>
              Refresh
            </button>
          </div>
        )}
      </div>
      {message && <p className={styles.success}>{message}</p>}
    </div>
  );
};

export default UserProfile;
