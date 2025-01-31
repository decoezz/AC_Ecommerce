import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./Home.module.css";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaImage,
  FaShoppingCart,
  FaBolt,
  FaStar,
  FaThermometerHalf,
} from "react-icons/fa";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInStock, setFilterInStock] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios({
        method: "GET",
        url: "http://127.0.0.1:4000/api/v1/products",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data.products) {
        setProducts(response.data.data.products);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load products. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.brand?.toLowerCase().includes(search) ||
          product.modelNumber?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search)
      );
    }

    // Apply in-stock filter
    if (filterInStock !== "all") {
      result = result.filter((product) =>
        filterInStock === "inStock" ? product.inStock : !product.inStock
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.price - b.price;
      }
      return b.price - a.price;
    });

    return result;
  }, [products, searchTerm, filterInStock, sortOrder]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Image URL helper
  const getImageUrl = (photo) => {
    if (!photo) return null;
    return photo.startsWith("http")
      ? photo
      : `${import.meta.env.VITE_API_URL}/${photo.replace(/\\/g, "/")}`;
  };

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.hero__content}>
          <h1 className={styles.hero__title}>Premium Air Conditioners</h1>
          <p className={styles.hero__subtitle}>
            Discover comfort with our selection of top-brand AC units
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className={styles.categories}>
        <div className={styles.category}>
          <FaBolt />
          <span>Energy Efficient</span>
        </div>
        <div className={styles.category}>
          <FaThermometerHalf />
          <span>Smart Cooling</span>
        </div>
        <div className={styles.category}>
          <FaStar />
          <span>Best Sellers</span>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for your perfect AC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterControls}>
            <div className={styles.filterSelect}>
              <select
                value={filterInStock}
                onChange={(e) => setFilterInStock(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="inStock">Available Now</option>
                <option value="outOfStock">Coming Soon</option>
              </select>
            </div>

            <button
              className={styles.sortButton}
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              <FaSortAmountDown />
              Price {sortOrder === "asc" ? "Low to High" : "High to Low"}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || filterInStock !== "all") && (
        <div className={styles.activeFilters}>
          {searchTerm && (
            <span className={styles.filterTag}>
              Search: {searchTerm}
              <button onClick={() => setSearchTerm("")}>×</button>
            </span>
          )}
          {filterInStock !== "all" && (
            <span className={styles.filterTag}>
              {filterInStock === "inStock" ? "In Stock" : "Out of Stock"}
              <button onClick={() => setFilterInStock("all")}>×</button>
            </span>
          )}
        </div>
      )}

      {/* Products Grid with Enhanced Cards */}
      <div className={styles.products__grid}>
        {!loading && !error && currentItems.length > 0
          ? currentItems.map((product) => (
              <div key={product._id} className={styles.product__card}>
                <div className={styles.product__imageContainer}>
                  {product.photos && product.photos.length > 0 ? (
                    <img
                      src={getImageUrl(product.photos[0])}
                      alt={`${product.brand} ${product.modelNumber}`}
                      className={styles.product__image}
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png";
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className={styles.noImage}>
                      <FaImage />
                      <p>Image Coming Soon</p>
                    </div>
                  )}
                  {product.inStock && (
                    <div className={styles.product__badge}>Available</div>
                  )}
                </div>
                <div className={styles.product__info}>
                  <div className={styles.product__brand}>{product.brand}</div>
                  <h3 className={styles.product__title}>
                    {product.modelNumber}
                  </h3>
                  <div className={styles.product__specs}>
                    {product.powerConsumption && (
                      <span className={styles.spec}>
                        <FaBolt /> {product.powerConsumption}W
                      </span>
                    )}
                    <span
                      className={`${styles.product__stock} ${
                        product.inStock ? styles.inStock : styles.outOfStock
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className={styles.product__footer}>
                    <div className={styles.product__price}>
                      ${product.price.toLocaleString()}
                    </div>
                    <Link
                      to={`/product/${product._id}`}
                      className={styles.product__button}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          : !loading &&
            !error && (
              <div className={styles.noResults}>
                <FaSearch size={48} />
                <h3>No Products Found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
      </div>

      {/* Enhanced Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Discovering perfect ACs for you...</p>
        </div>
      )}

      {/* Enhanced Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            First
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`${styles.pageButton} ${
                currentPage === i + 1 ? styles.activePage : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
