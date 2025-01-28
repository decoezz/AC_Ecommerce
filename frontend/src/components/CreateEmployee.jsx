import React, { useState } from "react";
import axios from "axios";
import styles from "./CreateEmployee.module.css";
import { FaCamera } from "react-icons/fa";

const CreateEmployee = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    setMessage("");
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    // Mobile number validation (11 digits)
    if (!formData.mobileNumber.match(/^\d{11}$/)) {
      setError("Please enter a valid 11-digit mobile number");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    // Password confirmation
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();

    // Reset messages
    setMessage("");
    setError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Check for token
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        // First create employee account
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/users/admin/signup`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // If there's a profile picture, upload it
        if (profilePicture && response.data.data._id) {
          const formDataPicture = new FormData();
          formDataPicture.append("profilePicture", profilePicture);

          try {
            await axios.put(
              `${import.meta.env.VITE_API_URL}/users/admin/upload-photo/${
                response.data.data._id
              }`,
              formDataPicture,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          } catch (photoError) {
            console.error("Error uploading profile picture:", photoError);
            setMessage(
              "Employee account created, but profile picture upload failed."
            );
            break;
          }
        }

        setMessage("Employee account created successfully!");
        // Clear form and preview
        setFormData({
          name: "",
          mobileNumber: "",
          email: "",
          password: "",
          passwordConfirm: "",
        });
        setProfilePicture(null);
        setPreviewUrl(null);
        break;
      } catch (err) {
        if (err.response?.status === 429) {
          // Rate limit error
          retries--;
          if (retries === 0) {
            setError("Too many requests. Please try again in a few minutes.");
          } else {
            await new Promise((res) => setTimeout(res, delay));
            delay *= 2; // Exponential backoff
            continue;
          }
        } else if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          break;
        } else if (err.response?.status === 403) {
          setError("You do not have permission to create employee accounts.");
          break;
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to create employee account. Please try again."
          );
          break;
        }
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className={styles.createEmployee}>
      <h2>Create Employee Account</h2>
      <form
        onSubmit={handleCreateEmployee}
        className={styles.createEmployeeForm}
      >
        {/* Profile Picture Upload Section */}
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile Preview"
                className={styles.avatarImage}
              />
            ) : (
              <span className={styles.avatarPlaceholder}>
                {formData.name.charAt(0) || "?"}
              </span>
            )}
            <label className={styles.uploadButton}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <FaCamera className={styles.cameraIcon} />
            </label>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter employee name"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="mobileNumber">Mobile Number:</label>
          <input
            id="mobileNumber"
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            placeholder="11-digit mobile number"
            pattern="[0-9]{11}"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Minimum 8 characters"
            minLength="8"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="passwordConfirm">Confirm Password:</label>
          <input
            id="passwordConfirm"
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            placeholder="Confirm password"
            minLength="8"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? styles.submitting : ""}
        >
          {isSubmitting ? "Creating..." : "Create Employee"}
        </button>
      </form>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default CreateEmployee;
