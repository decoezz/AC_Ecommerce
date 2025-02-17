import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaImage,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaShoppingCart,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { motion } from "framer-motion";
import styles from "./ProductDetails.module.css";
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingRatingId, setEditingRatingId] = useState(null);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Current Product ID:", id);

        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/products`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        // Debug the response structure
        console.log("Response Data Structure:", {
          status: response.data.status,
          totalResults: response.data.totalResults,
          products: response.data.data.products,
        });

        if (response.data.status === "success" && response.data.data.products) {
          // Ensure we're working with an array
          const products = Array.isArray(response.data.data.products)
            ? response.data.data.products
            : Object.values(response.data.data.products);

          const foundProduct = products.find((product) => {
            // Handle both string IDs and MongoDB-style objects
            const productId = product._id.$oid || product._id;
            return productId === id;
          });

          if (!foundProduct) {
            throw new Error("Product not found");
          }

          console.log("Found Product:", foundProduct);

          setProduct(foundProduct);
          // Set initial rating if user has already rated
          if (foundProduct.ratings && foundProduct.ratings.length > 0) {
            const userId = getUserIdFromToken();
            const userRating = foundProduct.ratings.find(
              (rating) => (rating.user.$oid || rating.user) === userId
            );
            if (userRating) {
              setUserRating(userRating.rating);
              setComment(userRating.comment || "");
            }
          }
        } else {
          throw new Error("Invalid product data received");
        }
      } catch (error) {
        console.error("Detailed Error Information:", {
          error,
          responseData: error.response?.data,
          message: error.message,
          stack: error.stack,
        });

        if (error.message === "Product not found") {
          setError("This product is no longer available.");
          setTimeout(() => {
            navigate("/shop");
          }, 2000);
        } else {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load product information"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // Helper function to get user ID from token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Improved add to cart function with quantity validation
  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (!product?._id) {
        setError("Product not found");
        return;
      }

      if (quantity <= 0) {
        setError("Please select a valid quantity");
        return;
      }

      if (quantity > product.quantityInStock) {
        setError("Quantity exceeds available stock");
        return;
      }

      const response = await axios({
        method: "POST",
        url: `${import.meta.env.VITE_API_URL}/cart`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          productId: product._id,
          quantity: quantity,
        },
      });

      if (response.status === 200 || response.status === 201) {
        // Show success message
        const successMessage = document.createElement("div");
        successMessage.className = styles.successMessage;
        successMessage.textContent = "Added to cart successfully!";
        document.body.appendChild(successMessage);

        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add item to cart");
    }
  };

  // Improved quantity handling
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.quantityInStock || 0)) {
      setQuantity(newQuantity);
    }
  };

  // Improved rating submission with validation
  const handleRatingSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (userRating === 0) {
        setError("Please select a rating");
        return;
      }

      const response = await axios({
        method: isEditing ? "PATCH" : "POST",
        url: `${import.meta.env.VITE_API_URL}/products/ratings/${product._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          rating: userRating,
          comment: comment.trim(),
          ...(isEditing && { ratingId: editingRatingId }),
        },
      });

      if (response.status === 200) {
        setProduct(response.data.data);
        setComment("");
        setUserRating(0);
        setIsEditing(false);
        setEditingRatingId(null);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit rating");
    }
  };

  // Helper function to get plain ID from MongoDB-style object
  const getPlainId = (idObject) => {
    if (typeof idObject === "string") return idObject;
    if (idObject && idObject.$oid) return idObject.$oid;
    return null;
  };

  // Helper function to format MongoDB date
  const formatDate = (dateObject) => {
    if (!dateObject) return "";
    const date = dateObject.$date
      ? new Date(dateObject.$date)
      : new Date(dateObject);
    return date.toLocaleDateString();
  };

  // Function to delete a rating
  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) return;

    // Get plain IDs at the start to ensure they're available throughout the function
    const plainProductId = getPlainId(product._id);
    const plainRatingId = getPlainId(ratingId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to delete rating");
        return;
      }

      // Check if we have the required data
      if (!plainProductId || !plainRatingId) {
        alert("Missing required data for rating deletion");
        return;
      }

      // Calculate the new ratings state
      const updatedRatings = product.ratings.filter(
        (r) => getPlainId(r._id) !== plainRatingId
      );
      const newAverageRating = calculateAverageRating(updatedRatings);
      const newReviewCount = updatedRatings.length;

      console.log("Deleting rating:", {
        productId: plainProductId,
        ratingId: plainRatingId,
        newAverageRating,
        newReviewCount,
      });

      const response = await axios({
        method: "DELETE",
        url: `http://127.0.0.1:4000/api/v1/products/ratings/${plainProductId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          ratingId: plainRatingId,
          averageRating: newAverageRating || 0, // Ensure it's always a number
          reviewCount: newReviewCount || 0,
        },
      });

      if (response.status === 200) {
        // Update local state with pre-calculated values
        const updatedProduct = {
          ...product,
          ratings: updatedRatings,
          reviewCount: newReviewCount,
          averageRating: newAverageRating,
        };

        setProduct(updatedProduct);
        localStorage.setItem("selectedProduct", JSON.stringify(updatedProduct));

        // Reset form if needed
        if (getPlainId(editingRatingId) === plainRatingId) {
          setIsEditing(false);
          setEditingRatingId(null);
          setUserRating(0);
          setComment("");
        }

        alert("Rating deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting rating:", error.response?.data || error);

      const errorMessage = error.response?.data?.message || error.message;
      console.log("Detailed error:", errorMessage);

      if (error.response?.status === 404) {
        alert("Rating not found. Please refresh the page.");
      } else if (error.response?.status === 403) {
        alert("You do not have permission to delete this rating.");
      } else if (error.response?.status === 400) {
        alert("Invalid request. Please try again.");
      } else if (error.response?.status === 500) {
        alert("Server error. Please try again later.");
        // Refresh the product data
        try {
          const productResponse = await axios.get(
            `http://127.0.0.1:4000/api/v1/products/${plainProductId}`
          );
          if (productResponse.data?.data) {
            setProduct(productResponse.data.data);
            localStorage.setItem(
              "selectedProduct",
              JSON.stringify(productResponse.data.data)
            );
          }
        } catch (refreshError) {
          console.error("Error refreshing product data:", refreshError);
        }
      } else {
        alert("Failed to delete rating. Please try again.");
      }

      // Reset form state
      setIsEditing(false);
      setEditingRatingId(null);
      setUserRating(0);
      setComment("");
    }
  };

  // Helper function to check if user owns the rating
  const isUserRating = (rating) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      return rating.user === decodedToken.id;
    } catch (error) {
      console.error("Error checking rating ownership:", error);
      return false;
    }
  };

  // Function to like a review
  const handleLikeReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to like reviews");
        return;
      }

      const response = await axios({
        method: "PUT",
        url: `http://127.0.0.1:4000/api/v1/products/ratings/${reviewId}/like`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setLikedReviews((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(reviewId)) {
            newSet.delete(reviewId);
          } else {
            newSet.add(reviewId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error liking review:", error);
      alert(error.response?.data?.message || "Failed to like review");
    }
  };

  // Function to check if user has already rated
  const checkUserRating = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Get user ID from token (you'll need to implement this based on your token structure)
    const userId = getUserIdFromToken();

    return product.ratings?.some((rating) => rating.user === userId);
  };

  // Function to check if user can edit rating
  const canEditRating = (rating) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const userId = getUserIdFromToken();
      return rating.user === userId;
    } catch (error) {
      console.error("Error checking rating permissions:", error);
      return false;
    }
  };

  // Update the renderRatingForm function
  const renderRatingForm = () => {
    if (!product) return null;

    const hasRated = product.ratings?.some((rating) => {
      const userId = getUserIdFromToken();
      return rating.user === userId;
    });

    if (hasRated && !isEditing) {
      return (
        <div className={styles.alreadyRated}>
          <p>You have already rated this product</p>
          <button
            className={styles.editButton}
            onClick={() => {
              const userRating = product.ratings.find((rating) => {
                const userId = getUserIdFromToken();
                return rating.user === userId;
              });
              if (userRating) {
                setIsEditing(true);
                setEditingRatingId(getPlainId(userRating._id));
                setUserRating(userRating.rating);
                setComment(userRating.comment || "");
              }
            }}
          >
            Edit Your Rating
          </button>
        </div>
      );
    }

    return (
      <div className={styles.ratingForm}>
        <div className={styles.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`${styles.starButton} ${
                star <= userRating ? styles.active : ""
              }`}
              onClick={() => setUserRating(star)}
            >
              <svg
                viewBox="0 0 576 512"
                className={styles.starIcon}
                width="1em"
                height="1em"
              >
                <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
              </svg>
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review..."
          className={styles.commentInput}
        />
        <button
          className={styles.submitButton}
          onClick={handleRatingSubmit}
          disabled={!userRating}
        >
          {isEditing ? "Update Review" : "Submit Review"}
        </button>
      </div>
    );
  };

  // Update the renderRatings function to show average rating
  const renderRatings = () => {
    if (!product?.ratings || product.ratings.length === 0) {
      return (
        <div className={styles.noRatings}>
          <p>No ratings yet. Be the first to rate this product!</p>
        </div>
      );
    }

    return (
      <>
        <div className={styles.averageRating}>
          <h3>Average Rating: {calculateAverageRating(product.ratings)} ⭐</h3>
          <p>({product.ratings.length} reviews)</p>
        </div>
        <div className={styles.ratingsList}>
          {product.ratings.map((rating) => (
            <div key={getPlainId(rating._id)} className={styles.ratingCard}>
              <div className={styles.ratingHeader}>
                <div className={styles.stars}>
                  {[...Array(rating.rating)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                {isUserRating(rating) && (
                  <div className={styles.ratingActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        setIsEditing(true);
                        setEditingRatingId(getPlainId(rating._id));
                        setUserRating(rating.rating);
                        setComment(rating.comment || "");
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteRating(rating._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              {rating.comment && (
                <p className={styles.ratingComment}>{rating.comment}</p>
              )}
              <p className={styles.ratingDate}>
                {formatDate(rating.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </>
    );
  };

  // Helper function to calculate average rating
  const calculateAverageRating = (ratings) => {
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
      return 0;
    }
    const validRatings = ratings.filter(
      (r) => typeof r.rating === "number" && !isNaN(r.rating)
    );
    if (validRatings.length === 0) {
      return 0;
    }
    const sum = validRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = sum / validRatings.length;
    return Number(avg.toFixed(1)) || 0;
  };

  // Improved loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading product details...</p>
      </div>
    );
  }

  // Improved error state
  if (error) {
    return (
      <div className={styles.error}>
        <h2>Oops!</h2>
        <p>{error}</p>
        <button className={styles.backButton} onClick={() => navigate("/shop")}>
          Return to Shop
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.error}>
        <h2>Product Not Found</h2>
        <p>The requested product could not be found.</p>
        <button
          className={styles.backButton}
          onClick={() => navigate("/products")}
        >
          Back to Products
        </button>
      </div>
    );
  }

  console.log("Current product state:", product); // Debug log

  return (
    <motion.div
      className={styles.productDetails}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.navigation}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Products
        </button>
      </div>

      <div className={styles.productContainer}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            {product.photos && product.photos.length > 0 ? (
              <img
                src={product.photos[selectedImage]}
                alt={`${product.brand} ${product.modelNumber}`}
              />
            ) : (
              <div className={styles.noImage}>
                <FaImage />
                <p>No Image Available</p>
              </div>
            )}
            <button
              className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {product.photos && product.photos.length > 1 && (
            <div className={styles.thumbnails}>
              {product.photos.map((photo, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${
                    selectedImage === index ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={photo} alt={`View ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.header}>
            <h1>{product.brand}</h1>
            <p className={styles.modelNumber}>Model: {product.modelNumber}</p>
          </div>

          <div className={styles.ratingSection}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  viewBox="0 0 576 512"
                  className={styles.starIcon}
                  width="1em"
                  height="1em"
                >
                  <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                </svg>
              ))}
            </div>
            <span className={styles.ratingCount}>
              {product.averageRating} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className={styles.price}>
            <span className={styles.amount}>${product.price}</span>
            <span className={styles.unitsSold}>
              {product.unitSold} units sold
            </span>
          </div>

          <div className={styles.stockInfo}>
            <span
              className={product?.inStock ? styles.inStock : styles.outOfStock}
            >
              {product?.inStock ? (
                <>
                  <span className={styles.dot}></span>
                  In Stock ({product?.quantityInStock || 0}{" "}
                  {product?.quantityInStock === 1 ? "unit" : "units"})
                </>
              ) : (
                <>
                  <span className={styles.dot}></span>
                  Out of Stock
                </>
              )}
            </span>
          </div>

          <div className={styles.specifications}>
            <h2>Specifications</h2>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <span>Power Consumption</span>
                <span>{product.powerConsumption}W</span>
              </div>
              <div className={styles.specItem}>
                <span>Cooling Capacity</span>
                <span>{product.coolingCapacitiy} Ton</span>
              </div>
              <div className={styles.specItem}>
                <span>Star Rating</span>
                <span>{product.starRating} ⭐</span>
              </div>
            </div>
          </div>

          {product.features && product.features.length > 0 && (
            <div className={styles.features}>
              <h2>Features</h2>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.addToCart}>
            <div className={styles.quantitySelector}>
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.quantityInStock}
              >
                +
              </button>
            </div>
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>

          <div className={styles.ratingsSection}>
            <h2>Ratings & Reviews</h2>

            {renderRatingForm()}

            {renderRatings()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
