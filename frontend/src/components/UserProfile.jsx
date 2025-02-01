import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./UserProfile.module.css";
import RoleOptionsModal from "./RoleOptionsModal";
import { FaCamera, FaEdit, FaKey, FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";

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
  const [likedProducts, setLikedProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
    name: "",
    email: "",
    mobileNumber: "",
  });
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

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

  // Fetch liked products
  const fetchLikedProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";

      const response = await axios.get(`${apiUrl}/users/user/likedProducts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure we're setting an array
      const products = response.data.data || [];
      setLikedProducts(Array.isArray(products) ? products : []);
    } catch (err) {
      console.error("Error fetching liked products:", err);
      setLikedProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initialize updateForm with user data when available
  useEffect(() => {
    if (userProfile) {
      setUpdateForm({
        currentPassword: "",
        password: "",
        passwordConfirm: "",
        name: userProfile.name || "",
        email: userProfile.email || "",
        mobileNumber: userProfile.mobileNumber || "",
      });
    }
  }, [userProfile]);

  // Update user information
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      // Validate current password
      if (!updateForm.currentPassword) {
        setUpdateError("Current password is required for any changes");
        return;
      }

      // Create update payload with only filled fields
      const updateData = {
        currentPassword: updateForm.currentPassword, // Always include current password
      };

      // Only include fields that have been changed
      if (updateForm.name && updateForm.name !== userProfile.name) {
        updateData.name = updateForm.name;
      }
      if (updateForm.email && updateForm.email !== userProfile.email) {
        updateData.email = updateForm.email;
      }
      if (
        updateForm.mobileNumber &&
        updateForm.mobileNumber !== userProfile.mobileNumber
      ) {
        updateData.mobileNumber = updateForm.mobileNumber;
      }

      // Only include password fields if new password is being set
      if (updateForm.password) {
        if (updateForm.password !== updateForm.passwordConfirm) {
          setUpdateError("New passwords do not match");
          return;
        }
        updateData.password = updateForm.password;
        updateData.passwordConfirm = updateForm.passwordConfirm;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 1) {
        // Only currentPassword present
        setUpdateError("No changes detected");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";

      const response = await axios.patch(`${apiUrl}/users/`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "success") {
        setUpdateSuccess("Profile updated successfully!");
        setIsEditing(false);

        // Update local user data
        const updatedUser = response.data.data;
        setUserProfile(updatedUser);
        localStorage.setItem("user", JSON.stringify({ user: updatedUser }));

        // Reset form
        setUpdateForm({
          currentPassword: "",
          password: "",
          passwordConfirm: "",
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          mobileNumber: updatedUser.mobileNumber || "",
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      setUpdateError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchLikedProducts();

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

        <div className={styles.userProfile__content}>
          {/* Profile Information Section */}
          <section className={styles.profileSection}>
            <h2>Profile Information</h2>
            {!isEditing ? (
              <div className={styles.profileInfo}>
                <div className={styles.infoRow}>
                  <span>Name:</span>
                  <span>{userProfile?.name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Email:</span>
                  <span>{userProfile?.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Mobile:</span>
                  <span>{userProfile?.mobileNumber || "Not set"}</span>
                </div>
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateUser} className={styles.updateForm}>
                <div className={styles.formGroup}>
                  <label>Current Password (required for any changes)</label>
                  <input
                    type="password"
                    value={updateForm.currentPassword}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={updateForm.name}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={updateForm.email}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    value={updateForm.mobileNumber}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        mobileNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>New Password (optional)</label>
                  <input
                    type="password"
                    value={updateForm.password}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={updateForm.passwordConfirm}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        passwordConfirm: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveButton}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {updateError && (
              <div className={styles.errorMessage}>{updateError}</div>
            )}
            {updateSuccess && (
              <div className={styles.successMessage}>{updateSuccess}</div>
            )}
          </section>

          {/* Wishlist Section */}
          <section className={styles.wishlistSection}>
            <h2>My Wishlist</h2>
            {loading ? (
              <div className={styles.loading}>Loading wishlist...</div>
            ) : (
              <div className={styles.wishlistGrid}>
                {Array.isArray(likedProducts) && likedProducts.length > 0 ? (
                  likedProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      className={styles.wishlistItem}
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={product.photos?.[0]}
                        alt={product.name}
                        className={styles.wishlistItemImage}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg"; // Add a placeholder image
                        }}
                      />
                      <div className={styles.wishlistItemInfo}>
                        <h3>
                          {product.brand} - {product.modelNumber}
                        </h3>
                        <p className={styles.price}>${product.price}</p>
                        <div className={styles.wishlistItemActions}>
                          <button className={styles.addToCartButton}>
                            Add to Cart
                          </button>
                          <button className={styles.removeFromWishlist}>
                            <FaHeart />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={styles.emptyWishlist}>
                    <p>No items in your wishlist</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
      {message && <p className={styles.success}>{message}</p>}
    </div>
  );
};

export default UserProfile;
