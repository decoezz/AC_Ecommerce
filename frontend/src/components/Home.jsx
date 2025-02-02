import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  FaHeart,
  FaRegHeart,
  FaStar,
  FaTools,
  FaCheckCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AddToCart from "./AddToCart";

const iconStyle = {
  color: "#000000", // Black color for icons
  fontSize: "1.5rem",
};

const largeIconStyle = {
  color: "#000000", // Black color for larger icons
  fontSize: "2.5rem",
};

const starIconStyle = {
  color: "#FFD700", // This is a golden yellow color
  marginRight: "4px",
};

const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.notification} role="alert">
      <FaCheckCircle className={styles.notification__icon} aria-hidden="true" />
      <span className={styles.notification__message}>{message}</span>
    </div>
  );
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
  const [productRatings, setProductRatings] = useState({});
  const [ratingInput, setRatingInput] = useState({
    productId: null,
    rating: 0,
    comment: "",
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { id: "all", name: "All Products", icon: FaShoppingCart },
    { id: "energy", name: "Energy Efficient", icon: FaBolt },
    { id: "cooling", name: "Cooling", icon: FaSnowflake },
    { id: "eco", name: "Eco Friendly", icon: FaLeaf },
    { id: "temperature", name: "Temperature Control", icon: FaThermometerHalf },
    { id: "airflow", name: "Air Flow", icon: FaWind },
  ];

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

  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.brand?.toLowerCase().includes(search) ||
          product.modelNumber?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search)
      );
    }

    if (filterInStock !== "all") {
      result = result.filter((product) =>
        filterInStock === "inStock" ? product.inStock : !product.inStock
      );
    }

    result.sort((a, b) => {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    });

    return result;
  }, [products, searchTerm, filterInStock, sortOrder, selectedCategory]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getImageUrl = (photo) => {
    if (!photo) return null;
    return photo.startsWith("http")
      ? photo
      : `${import.meta.env.VITE_API_URL}/${photo.replace(/\\/g, "/")}`;
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault(); // Prevent navigation
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:4000/api/v1/cart/",
        {
          productId: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.message || "Error adding product to cart");
    }
  };

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

  const openRatingModal = (productId) => {
    setRatingInput({
      productId,
      rating: productRatings[productId]?.[0]?.rating || 0,
      comment: productRatings[productId]?.[0]?.comment || "",
    });
    setShowRatingModal(true);
  };

  const handleRating = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to rate products");
        return;
      }

      const existingRating = productRatings[ratingInput.productId]?.[0];
      const method = existingRating ? "PATCH" : "POST";
      const url = `http://127.0.0.1:4000/api/v1/products/ratings/${ratingInput.productId}`;

      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          rating: ratingInput.rating,
          comment: ratingInput.comment,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setShowRatingModal(false);
        alert("Rating submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(error.response?.data?.message || "Failed to submit rating");
    }
  };

  const handleDeleteRating = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to delete ratings");
        return;
      }

      const response = await axios({
        method: "DELETE",
        url: `http://127.0.0.1:4000/api/v1/products/ratings/${productId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("Rating deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      alert(error.response?.data?.message || "Failed to delete rating");
    }
  };

  const handleProductClick = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    localStorage.setItem("selectedProduct", JSON.stringify(product));
    navigate(`/product/${product._id}`);
  };

  const ProductDetailsModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={`${styles.modal} ${styles.productModal}`}>
          <div className={styles.modalHeader}>
            <h2>Product Details</h2>
            <button
              className={styles.closeButton}
              onClick={() => setShowProductModal(false)}
            >
              ×
            </button>
          </div>
          <div className={styles.modalContent}>
            <div className={styles.productImage}>
              {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
                <img
                  src={selectedProduct.photos[0]}
                  alt={`${selectedProduct.brand} ${selectedProduct.modelNumber}`}
                />
              ) : (
                <div className={styles.noImage}>
                  <FaImage />
                  <p>No Image Available</p>
                </div>
              )}
            </div>
            <div className={styles.productDetails}>
              <h3>{selectedProduct.brand}</h3>
              <p className={styles.modelNumber}>
                Model: {selectedProduct.modelNumber}
              </p>
              <p className={styles.price}>Price: ${selectedProduct.price}</p>
              <p className={styles.stock}>
                Status: {selectedProduct.inStock ? "In Stock" : "Out of Stock"}
                {selectedProduct.inStock &&
                  ` (${selectedProduct.quantityInStock} units)`}
              </p>
              <div className={styles.specifications}>
                <h4>Specifications:</h4>
                <ul>
                  <li>
                    Power Consumption: {selectedProduct.powerConsumption}W
                  </li>
                  <li>
                    Cooling Capacity: {selectedProduct.coolingCapacitiy} Ton
                  </li>
                  <li>Star Rating: {selectedProduct.starRating} ⭐</li>
                  {selectedProduct.features &&
                    selectedProduct.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                </ul>
              </div>
              <div className={styles.ratings}>
                <h4>Ratings & Reviews:</h4>
                <p>Average Rating: {selectedProduct.averageRating} ⭐</p>
                <p>Review Count: {selectedProduct.reviewCount}</p>
                <p>Units Sold: {selectedProduct.unitSold}</p>
              </div>
              {selectedProduct.ratings &&
                selectedProduct.ratings.length > 0 && (
                  <div className={styles.userRatings}>
                    <h4>Latest Rating:</h4>
                    {selectedProduct.ratings.map((rating, index) => (
                      <div key={index} className={styles.rating}>
                        <p>Rating: {rating.rating} ⭐</p>
                        <p>
                          Date:{" "}
                          {new Date(
                            rating.createdAt.$date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductCard = (product) => {
    return (
      <motion.div
        key={`product-${product._id}`}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={styles.productCard}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <Link to={`/product/${product._id}`} className={styles.productLink}>
          <div className={styles.imageContainer}>
            <img
              src={product.photos?.[0] || "/placeholder.jpg"}
              alt={product.brand}
              className={styles.productImage}
            />
            {product.discount > 0 && (
              <div className={styles.discountBadge}>
                <FaPercent /> {product.discount}% OFF
              </div>
            )}
          </div>

          <div className={styles.productInfo}>
            <h3 className={styles.productTitle}>
              {product.brand} {product.modelNumber}
            </h3>
            <div className={styles.productMeta}>
              <div className={styles.rating}>
                <FaStar className={styles.starIcon} aria-hidden="true" />
                <span>{product.averageRating?.toFixed(1) || "N/A"}</span>
              </div>
              <span className={styles.price}>
                ${product.price.toLocaleString()}
              </span>
            </div>
            <p className={styles.productDescription}>{product.description}</p>
            <div className={styles.cardFooter}>
              <span
                className={`${styles.status} ${
                  product.inStock ? styles.inStock : styles.outOfStock
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
              <motion.button
                className={styles.addToCartButton}
                onClick={(e) => handleAddToCart(e, product._id)}
                disabled={!product.inStock}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaShoppingCart /> Add to Cart
              </motion.button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
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

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error loading products</h2>
        <p>{error}</p>
        <button onClick={fetchProducts} className={styles.retryButton}>
          Retry
        </button>
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
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Stay Cool & Comfortable</h1>
          <p className={styles.heroSubtitle}>
            Premium Air Conditioners from Top Brands
          </p>
          <div className={styles.heroFeatures}>
            <div className={styles.featureItem}>
              <FaBolt />
              <span>Energy Efficient</span>
            </div>
            <div className={styles.featureItem}>
              <FaLeaf />
              <span>Eco-Friendly</span>
            </div>
            <div className={styles.featureItem}>
              <FaSnowflake />
              <span>Smart Cooling</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterControls}>
          <select
            value={filterInStock}
            onChange={(e) => setFilterInStock(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Items</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={styles.sortButton}
          >
            <FaSortAmountDown /> {sortOrder === "asc" ? "Price ↑" : "Price ↓"}
          </button>
        </div>
      </div>

      <motion.div
        className={styles.productsSection}
        variants={containerVariants}
      >
        <motion.h2 className={styles.sectionTitle} variants={itemVariants}>
          Featured Air Conditioners
        </motion.h2>
        <div className={styles.products__grid}>
          {!loading && !error && currentItems.length > 0
            ? currentItems.map((product) => renderProductCard(product))
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

      <section className={styles.whyChooseUs}>
        <motion.h2
          className={styles.whyTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Why Choose Us
        </motion.h2>
        <div className={styles.featureGrid}>
          <motion.div
            className={styles.featureCard}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.iconWrapper}>
              <FaTools className={styles.featureIcon} />
            </div>
            <h3>Expert Installation</h3>
            <p>Professional installation by certified technicians</p>
            <ul className={styles.featureList}>
              <li>
                <FaCheckCircle /> Certified Experts
              </li>
              <li>
                <FaCheckCircle /> Quick Service
              </li>
              <li>
                <FaCheckCircle /> Quality Assurance
              </li>
            </ul>
          </motion.div>

          <motion.div
            className={styles.featureCard}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.iconWrapper}>
              <FaBolt className={styles.featureIcon} />
            </div>
            <h3>Energy Efficient</h3>
            <p>Save on electricity bills with our energy-rated ACs</p>
            <ul className={styles.featureList}>
              <li>
                <FaCheckCircle /> Lower Bills
              </li>
              <li>
                <FaCheckCircle /> Smart Technology
              </li>
              <li>
                <FaCheckCircle /> Power Saving
              </li>
            </ul>
          </motion.div>

          <motion.div
            className={styles.featureCard}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.iconWrapper}>
              <FaLeaf className={styles.featureIcon} />
            </div>
            <h3>Eco-Friendly</h3>
            <p>Environmental-friendly cooling solutions</p>
            <ul className={styles.featureList}>
              <li>
                <FaCheckCircle /> Green Technology
              </li>
              <li>
                <FaCheckCircle /> Sustainable
              </li>
              <li>
                <FaCheckCircle /> Clean Air
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {!loading && !error && totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <motion.button
              key={`page-${index + 1}`}
              className={`${styles.pageButton} ${
                currentPage === index + 1 ? styles.activePage : ""
              }`}
              onClick={() => paginate(index + 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>
      )}

      {showRatingModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Rate Product</h2>
            <form onSubmit={handleRating}>
              <div className={styles.ratingInput}>
                <label>Rating (1-5):</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={ratingInput.rating}
                  onChange={(e) =>
                    setRatingInput((prev) => ({
                      ...prev,
                      rating: parseInt(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className={styles.commentInput}>
                <label>Comment:</label>
                <textarea
                  value={ratingInput.comment}
                  onChange={(e) =>
                    setRatingInput((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowRatingModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProductModal && <ProductDetailsModal />}

      {showNotification && (
        <Notification
          message="Product added to cart successfully! 🛍️"
          onClose={() => setShowNotification(false)}
        />
      )}
    </motion.div>
  );
};

export default Home;
