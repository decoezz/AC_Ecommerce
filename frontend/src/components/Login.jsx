import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";

      // Step 1: Log in the user
      const loginResponse = await axios({
        method: "post",
        url: `${apiUrl}/users/login`,
        data: {
          email,
          password,
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("Login Response:", loginResponse.data); // Debug log

      if (!loginResponse.data || !loginResponse.data.token) {
        throw new Error("Invalid login response");
      }

      const { token, data } = loginResponse.data;
      localStorage.setItem("token", token);

      // Try to get user data from login response first
      let userData = data?.user || null;

      // Only try to fetch additional user data if not present in login response
      if (!userData) {
        try {
          const userResponse = await axios({
            method: "get",
            url: `${apiUrl}/users/me`,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });

          if (userResponse.data?.data) {
            userData = userResponse.data.data;
          }
        } catch (userError) {
          console.warn("Failed to fetch additional user data:", userError);
          // Continue with login if we have basic user data
        }
      }

      // If we still don't have user data, try to extract from token
      if (!userData && token) {
        try {
          // Attempt to decode JWT token to get basic user info
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );

          userData = JSON.parse(jsonPayload);
        } catch (tokenError) {
          console.warn("Failed to decode token:", tokenError);
        }
      }

      if (!userData) {
        throw new Error("Unable to get user data");
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("User data:", userData); // Debug log

      // Redirect based on role (case-insensitive check)
      const userRole = (userData.role || "").toLowerCase();
      switch (userRole) {
        case "admin":
          navigate("/admin-home");
          break;
        case "employee":
          navigate("/employee-home");
          break;
        case "user":
          navigate("/user-home");
          break;
        default:
          console.warn("Unknown user role:", userData.role);
          navigate("/");
          break;
      }
    } catch (err) {
      console.error("Login error:", err);

      // Clear any existing auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 429) {
        setError("Too many attempts. Please try again later");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again in a few moments");
      } else if (!navigator.onLine) {
        setError("No internet connection. Please check your network");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "An error occurred during login. Please try again"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <h2 className={styles.login__title}>Login</h2>
      <form className={styles.login__form} onSubmit={handleSubmit}>
        {error && (
          <div className={styles.login__error}>
            <p>{error}</p>
            <button
              className={styles.login__errorDismiss}
              onClick={() => setError("")}
              type="button"
            >
              ✕
            </button>
          </div>
        )}
        <div className={styles.login__inputContainer}>
          <label className={styles.login__label}>Email:</label>
          <input
            className={styles.login__input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        <div className={styles.login__inputContainer}>
          <label className={styles.login__label}>Password:</label>
          <input
            className={styles.login__input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
            minLength={6}
          />
        </div>
        <button
          className={`${styles.login__button} ${
            loading ? styles.login__button_loading : ""
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className={styles.login__link}>
        Don't have an account? <Link to="/create-account">Create one here</Link>
      </p>
    </div>
  );
};

export default Login;
