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
  FaSnowflake,
  FaLeaf,
  FaThermometerHalf,
  FaWind,
  FaPercent,
} from "react-icons/fa";
import { motion } from "framer-motion";

const iconStyle = {
  color: "#000000", // Black color for icons
  fontSize: "1.5rem",
};

const largeIconStyle = {
  color: "#000000", // Black color for larger icons
  fontSize: "2.5rem",
};

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

  const handleAddToCart = (product) => {
    try {
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

      // Check if product already exists in cart
      const existingProduct = existingCart.find(
        (item) => item._id === product._id
      );

      if (existingProduct) {
        // Update quantity if product exists
        existingProduct.quantity += 1;
        alert(
          `Increased ${product.brand} ${product.modelNumber} quantity in cart`
        );
      } else {
        // Add new product to cart
        existingCart.push({
          ...product,
          quantity: 1,
        });
        alert(`Added ${product.brand} ${product.modelNumber} to cart`);
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(existingCart));
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingIcon}>
            <FaSnowflake style={largeIconStyle} className={styles.snowflake} />
          </div>
          <h2>Loading Amazing Products</h2>
          <div className={styles.loadingBar}>
            <div className={styles.loadingProgress}></div>
          </div>
          <p>Please wait while we cool things down...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.home}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section with Animation */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.hero__content}>
          <h1 className={styles.hero__title}>Stay Cool & Comfortable</h1>
          <p className={styles.hero__subtitle}>
            Premium Air Conditioners from Top Brands
          </p>
          <div className={styles.hero__features}>
            <span>
              <FaBolt style={iconStyle} /> Energy Efficient
            </span>
            <span>
              <FaLeaf style={iconStyle} /> Eco-Friendly
            </span>
            <span>
              <FaWind style={iconStyle} /> Smart Cooling
            </span>
          </div>
        </div>
      </motion.div>

      {/* Promotional Banner with Animation */}
      <motion.div className={styles.promoBanner} variants={containerVariants}>
        <div className={styles.promoItem}>
          <FaPercent />
          <span>Special Summer Discount</span>
        </div>
        <div className={styles.promoItem}>
          <FaShoppingCart />
          <span>Free Installation</span>
        </div>
        <div className={styles.promoItem}>
          <FaSnowflake />
          <span>2 Year Warranty</span>
        </div>
      </motion.div>

      {/* Categories with Animation */}
      <motion.div className={styles.categories} variants={containerVariants}>
        <motion.h2 className={styles.sectionTitle} variants={itemVariants}>
          Shop by Category
        </motion.h2>
        <div className={styles.categoryGrid}>
          <div className={styles.categoryCard}>
            <FaSnowflake style={iconStyle} />
            <h3>Split ACs</h3>
            <p>Perfect for single rooms</p>
          </div>
          <div className={styles.categoryCard}>
            <FaWind style={iconStyle} />
            <h3>Window ACs</h3>
            <p>Compact and efficient</p>
          </div>
          <div className={styles.categoryCard}>
            <FaBolt style={iconStyle} />
            <h3>Inverter ACs</h3>
            <p>Energy saving technology</p>
          </div>
          <div className={styles.categoryCard}>
            <FaThermometerHalf style={iconStyle} />
            <h3>Smart ACs</h3>
            <p>WiFi enabled control</p>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <div className={styles.searchWrapper}>
            <FaSearch
              style={{
                ...iconStyle,
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search by brand, model, or features..."
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
                <option value="all">Availability</option>
                <option value="inStock">Ready to Install</option>
                <option value="outOfStock">Pre-Order</option>
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

      {/* Products Grid with Animation */}
      <motion.div
        className={styles.productsSection}
        variants={containerVariants}
      >
        <motion.h2 className={styles.sectionTitle} variants={itemVariants}>
          Featured Air Conditioners
        </motion.h2>
        <div className={styles.products__grid}>
          {!loading && !error && currentItems.length > 0
            ? currentItems.map((product) => (
                <motion.div
                  key={product._id}
                  className={styles.product__card}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                >
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
                      <div className={styles.product__badge}>
                        Quick Installation Available
                      </div>
                    )}
                  </div>
                  <div className={styles.product__info}>
                    <div className={styles.product__brand}>{product.brand}</div>
                    <h3 className={styles.product__title}>
                      {product.modelNumber}
                    </h3>
                    <div className={styles.product__features}>
                      {product.powerConsumption && (
                        <span className={styles.feature}>
                          <FaBolt style={iconStyle} />{" "}
                          {product.powerConsumption}W
                        </span>
                      )}
                      <span className={styles.feature}>
                        <FaSnowflake style={iconStyle} />{" "}
                        {product.coolingCapacity || "1.5"} Ton
                      </span>
                    </div>
                    <div className={styles.product__footer}>
                      <div className={styles.priceSection}>
                        <div className={styles.product__price}>
                          ${product.price.toLocaleString()}
                        </div>
                        <div className={styles.installment}>
                          or ${Math.round(product.price / 12)}/mo with EMI
                        </div>
                      </div>
                      <div className={styles.product__actions}>
                        <Link
                          to={`/product/${product._id}`}
                          className={styles.viewDetails__button}
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={styles.addToCart__button}
                          disabled={!product.inStock}
                        >
                          <FaShoppingCart style={iconStyle} />
                          {product.inStock ? "Add to Cart" : "Out of Stock"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            : !loading &&
              !error && (
                <div className={styles.noResults}>
                  <FaSearch style={largeIconStyle} />
                  <h3>No Products Found</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              )}
        </div>
      </motion.div>

      {/* Why Choose Us Section */}
      <div className={styles.whyChooseUs}>
        <h2 className={styles.sectionTitle}>Why Choose Us</h2>
        <div className={styles.features}>
          <div className={styles.feature}>
            <FaShoppingCart />
            <h3>Expert Installation</h3>
            <p>Professional installation by certified technicians</p>
          </div>
          <div className={styles.feature}>
            <FaBolt />
            <h3>Energy Efficient</h3>
            <p>Save on electricity bills with our energy-rated ACs</p>
          </div>
          <div className={styles.feature}>
            <FaLeaf />
            <h3>Eco-Friendly</h3>
            <p>Environmental-friendly cooling solutions</p>
          </div>
        </div>
      </div>

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
    </motion.div>
  );
};

export default Home;
