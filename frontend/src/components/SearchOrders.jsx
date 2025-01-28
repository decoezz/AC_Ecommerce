import React, { useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./SearchOrders.module.css";
import debounce from "lodash/debounce";

const SearchOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [status, setStatus] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);

  // Debounced search function to prevent too many requests
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query) return;

      try {
        const token = localStorage.getItem("token");
        const baseURL = import.meta.env.VITE_API_URL;

        const response = await axios.get(`${baseURL}/orders/user/${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSearchResults(response.data.data || []);
        setError("");
      } catch (err) {
        if (err.response?.status === 429) {
          const retryAfterSeconds = err.response.headers["retry-after"] || 60;
          setRetryAfter(retryAfterSeconds);
          setError(
            `Too many requests. Please try again in ${retryAfterSeconds} seconds.`
          );

          // Start countdown
          const timer = setInterval(() => {
            setRetryAfter((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                setError("");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setError(err.response?.data?.message || "Failed to search orders");
        }
        setSearchResults([]);
      }
    }, 1000), // 1 second delay
    []
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (retryAfter > 0) {
      setError(`Please wait ${retryAfter} seconds before trying again.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_API_URL;

      let endpoint;

      if (dateRange.start || dateRange.end) {
        endpoint = `${baseURL}/orders/GetOrders`;
      } else if (status === "today") {
        endpoint = `${baseURL}/orders/today`;
      } else if (status === "week") {
        endpoint = `${baseURL}/orders/last-week`;
      } else if (status === "month") {
        endpoint = `${baseURL}/orders/last-month`;
      } else {
        endpoint = `${baseURL}/orders/GetOrders`;
      }

      // If searching by mobile number
      if (searchQuery && searchQuery.match(/^\d+$/)) {
        debouncedSearch(searchQuery);
        return;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSearchResults(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfterSeconds = err.response.headers["retry-after"] || 60;
        setRetryAfter(retryAfterSeconds);
        setError(
          `Too many requests. Please try again in ${retryAfterSeconds} seconds.`
        );
      } else {
        setError(err.response?.data?.message || "Failed to search orders");
      }
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If it's a mobile number, use debounced search
    if (value.match(/^\d+$/)) {
      debouncedSearch(value);
    }
  };

  return (
    <div className={styles.searchOrders}>
      <h2>Search Orders</h2>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Search by mobile number"
            value={searchQuery}
            onChange={handleInputChange}
            className={styles.searchInput}
            disabled={retryAfter > 0}
          />
          {retryAfter > 0 && (
            <div className={styles.retryTimer}>
              Please wait {retryAfter} seconds before searching again
            </div>
          )}
        </div>

        <div className={styles.dateRangeContainer}>
          <div className={styles.formGroup}>
            <label>Start Date:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className={styles.dateInput}
              disabled={retryAfter > 0}
            />
          </div>
          <div className={styles.formGroup}>
            <label>End Date:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className={styles.dateInput}
              disabled={retryAfter > 0}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          type="submit"
          className={styles.searchButton}
          disabled={retryAfter > 0}
        >
          Search Orders
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Searching orders...</div>
      ) : (
        <div className={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.customerName}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={styles[order.status]}>
                        {order.status}
                      </span>
                    </td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <Link
                        to={`/orders/details/${order._id}`}
                        className={styles.viewButton}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noResults}>
              No orders found matching your search criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchOrders;
