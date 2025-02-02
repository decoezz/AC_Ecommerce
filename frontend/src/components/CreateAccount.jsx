import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CreateAccount.module.css";
import { FaCamera } from "react-icons/fa";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      // Redirect based on user role
      switch (user.role) {
        case "Admin":
          navigate("/admin-home");
          break;
        case "Employee":
          navigate("/employee-home");
          break;
        case "Customer":
          navigate("/customer-home");
          break;
        default:
          navigate("/");
      }
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // First, create the user account
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/signup`,
        {
          name,
          email,
          mobileNumber,
          password,
          passwordConfirm,
        }
      );

      // Save token and user data
      const token = response.data.token;
      localStorage.setItem("user", JSON.stringify(response.data.data));
      localStorage.setItem("token", token);

      // If there's a profile picture, upload it
      if (profilePicture) {
        const formData = new FormData();
        formData.append("profilePicture", profilePicture);

        await axios.put(
          `${import.meta.env.VITE_API_URL}/users/upload-photo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      // Navigate based on user role
      const user = response.data.data;
      switch (user.role) {
        case "Admin":
          navigate("/admin-home");
          break;
        case "Employee":
          navigate("/employee-home");
          break;
        case "Customer":
          navigate("/customer-home");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred during signup. Please try again."
      );
    }
  };

  return (
    <div className={styles.createAccount}>
      <h2 className={styles.createAccount__title}>Create Account</h2>
      <form className={styles.createAccount__form} onSubmit={handleSubmit}>
        {error && <p className={styles.createAccount__error}>{error}</p>}

        <div className={styles.createAccount__avatarContainer}>
          <div className={styles.createAccount__avatar}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile Preview"
                className={styles.createAccount__avatarImage}
              />
            ) : (
              <span className={styles.createAccount__avatarPlaceholder}>
                {name.charAt(0) || "?"}
              </span>
            )}
            <label className={styles.createAccount__uploadButton}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.createAccount__fileInput}
              />
              <FaCamera className={styles.createAccount__cameraIcon} />
            </label>
          </div>
        </div>

        <div className={styles.createAccount__inputContainer}>
          <label className={styles.createAccount__label}>Name:</label>
          <input
            className={styles.createAccount__input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.createAccount__inputContainer}>
          <label className={styles.createAccount__label}>Email:</label>
          <input
            className={styles.createAccount__input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.createAccount__inputContainer}>
          <label className={styles.createAccount__label}>Mobile Number:</label>
          <input
            className={styles.createAccount__input}
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>
        <div className={styles.createAccount__inputContainer}>
          <label className={styles.createAccount__label}>Password:</label>
          <input
            className={styles.createAccount__input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.createAccount__inputContainer}>
          <label className={styles.createAccount__label}>
            Confirm Password:
          </label>
          <input
            className={styles.createAccount__input}
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>
        <button className={styles.createAccount__button} type="submit">
          Create Account
        </button>
      </form>
      <p className={styles.createAccount__link}>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
};

export default CreateAccount;
