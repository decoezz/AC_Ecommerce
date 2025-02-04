import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import styles from "./ManageProducts.module.css";
import {
  FaRegTrashAlt,
  FaRegEdit,
  FaRegImages,
  FaRegCircle,
  FaSearch,
  FaRegPlusSquare,
  FaBox,
  FaBarcode,
  FaBolt,
  FaRegMoneyBillAlt,
  FaWarehouse,
  FaThermometerHalf,
  FaRegSave,
  FaTimes,
  FaSync,
  FaFilter,
  FaSortAmountDown,
  FaExclamationCircle,
  FaCheckCircle,
  FaCamera,
  FaCloudUploadAlt,
  FaImage,
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const iconStyle = {
  color: "#4338ca",
  fontSize: "1.2rem",
  verticalAlign: "middle",
  marginRight: "8px",
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState({
    brand: "",
    modelNumber: "",
    powerConsumption: "",
    price: "",
    inStock: false,
    quantityInStock: "",
    coolingCapacity: "",
    photos: null,
  });
  const [serverStatus, setServerStatus] = useState("checking");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterInStock, setFilterInStock] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkServerConnection = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
        timeout: 5000, // 5 second timeout
      });
      setServerStatus("connected");
      return true;
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setServerStatus("disconnected");
        setError(
          "Cannot connect to server. Please check if the backend server is running."
        );
      } else if (err.response?.status === 401) {
        setServerStatus("unauthorized");
        setError("Unauthorized. Please log in again.");
      } else {
        setServerStatus("error");
        setError("An unexpected error occurred.");
      }
      console.error("Server connection error:", err);
      return false;
    }
  };

  const fetchProducts = async (brand = "") => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (
      !token ||
      !user ||
      (user.role !== "Admin" && user.role !== "Employee")
    ) {
      navigate("/not-found");
      return;
    }

    if (await checkServerConnection()) {
      try {
        const url = brand
          ? `${import.meta.env.VITE_API_URL}/products?brand=${brand}`
          : `${import.meta.env.VITE_API_URL}/products`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data.data.products || []);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(err.response?.data?.message || "Failed to fetch products.");
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // Set up periodic server connection check
    const intervalId = setInterval(checkServerConnection, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [refreshTrigger, navigate]);

  // Update the displayedProducts useMemo to safely handle undefined values
  const displayedProducts = useMemo(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter((product) => {
        // Safely convert values to string and handle undefined/null
        const brand = (product.brand || "").toLowerCase();
        const modelNumber = (product.modelNumber || "").toLowerCase();
        const powerConsumption = String(product.powerConsumption || "");
        const price = String(product.price || "");
        const coolingCapacity = String(product.coolingCapacity || "");

        return (
          brand.includes(searchLower) ||
          modelNumber.includes(searchLower) ||
          powerConsumption.includes(searchLower) ||
          price.includes(searchLower) ||
          coolingCapacity.includes(searchLower)
        );
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.price || 0) - (b.price || 0);
      }
      return (b.price || 0) - (a.price || 0);
    });

    return result;
  }, [products, searchTerm, sortOrder]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = value;

    // Handle different input types
    if (type === "checkbox") {
      finalValue = checked;
    } else if (type === "number") {
      finalValue = value === "" ? "" : value;
    }

    setNewProduct((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Convert and validate numeric values
      const productData = {
        brand: newProduct.brand.trim(),
        modelNumber: newProduct.modelNumber.trim(),
        powerConsumption: parseInt(newProduct.powerConsumption),
        price: parseFloat(newProduct.price),
        inStock: newProduct.inStock,
        quantityInStock: parseInt(newProduct.quantityInStock),
        coolingCapacitiy: newProduct.coolingCapacity.trim(),
      };

      // Validate required fields
      if (
        !productData.brand ||
        !productData.modelNumber ||
        !productData.powerConsumption ||
        !productData.price ||
        !productData.coolingCapacitiy ||
        !productData.quantityInStock
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Append all product data
      Object.keys(productData).forEach((key) => {
        formData.append(key, productData[key]);
      });

      // Handle photos
      if (newProduct.photos && newProduct.photos.length > 0) {
        Array.from(newProduct.photos).forEach((photo) => {
          formData.append("photos", photo);
        });
      }

      // Get token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Log the data being sent (for debugging)
      console.log("Sending product data:", productData);

      const response = await axios({
        method: "POST",
        url: "http://127.0.0.1:4000/api/v1/products",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        // Reset the form
        setNewProduct({
          brand: "",
          modelNumber: "",
          powerConsumption: "",
          price: "",
          inStock: false,
          quantityInStock: "",
          coolingCapacity: "",
          photos: null,
        });
        setShowAddForm(false);

        // Trigger refresh by incrementing refreshTrigger
        setRefreshTrigger((prev) => prev + 1);

        alert("Product added successfully!");
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // More specific error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add product. Please check all required fields.";

      alert(errorMessage);
    }
  };

  const handleEditProduct = async (productId, updatedData) => {
    try {
      setIsLoading(true);
      // Show processing message
      toast.loading("Processing your request...", {
        position: "top-center",
        style: {
          background: "#3B82F6",
          color: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
        },
      });

      const token = localStorage.getItem("token");

      const productUpdateData = {
        brand: updatedData.brand,
        modelNumber: updatedData.modelNumber,
        coolingCapacitiy: updatedData.coolingCapacitiy,
        powerConsumption: Number(updatedData.powerConsumption),
        price: Number(updatedData.price),
        quantityInStock: Number(updatedData.quantityInStock),
        inStock: updatedData.quantityInStock > 0,
        features: updatedData.features || [],
      };

      // Update product data
      const productResponse = await axios({
        method: "PATCH",
        url: `http://127.0.0.1:4000/api/v1/products/${productId}`,
        data: productUpdateData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Handle photo updates if needed
      if (updatedData.photos && updatedData.photos.length > 0) {
        // Show photo upload message
        toast.loading("Uploading photos...", {
          position: "top-center",
          style: {
            background: "#3B82F6",
            color: "#FFFFFF",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
          },
        });

        const formData = new FormData();
        updatedData.photos.forEach((photo) => {
          formData.append("photos", photo);
        });

        await axios({
          method: "PUT",
          url: `http://127.0.0.1:4000/api/v1/products/update-product-images/${productId}`,
          data: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (productResponse.data.status === "success") {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? {
                  ...product,
                  ...productUpdateData,
                  photos: productResponse.data.data.photos || product.photos,
                  averageRating: product.averageRating,
                  likes: product.likes,
                  ratings: product.ratings,
                  reviewCount: product.reviewCount,
                }
              : product
          )
        );

        // Clear any existing toasts
        toast.dismiss();

        // Show final success message
        toast.success("✨ Process Completed Successfully! ✨", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#FFFFFF",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #064E3B",
          },
          icon: "🎉",
        });

        setEditingProduct(null);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      // Clear any existing toasts
      toast.dismiss();

      // Show error message
      toast.error("❌ Process Failed! Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #991B1B",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleDeleteImage = async (productId, publicId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/delete-product-image`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { publicId, productId },
        }
      );
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete image.");
    }
  };

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Apply filters
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
  }, [products, filterInStock, sortOrder]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // File input handler with validation
  const handleFileChange = (e) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      setNewProduct((prev) => ({ ...prev, photos: null }));
      return;
    }

    if (files.length > 5) {
      alert("Maximum 5 photos allowed");
      e.target.value = "";
      return;
    }

    // Validate each file
    const validFiles = Array.from(files).every((file) => {
      if (!file.type.match("image.*")) {
        alert("Only image files are allowed");
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        alert("Each file must be less than 5MB");
        return false;
      }

      return true;
    });

    if (!validFiles) {
      e.target.value = "";
      setNewProduct((prev) => ({ ...prev, photos: null }));
      return;
    }

    setNewProduct((prev) => ({ ...prev, photos: files }));
  };

  // Add form validation before submission
  const validateForm = () => {
    const requiredFields = [
      "brand",
      "modelNumber",
      "powerConsumption",
      "price",
      "coolingCapacity",
      "quantityInStock",
    ];

    const missingFields = requiredFields.filter((field) => !newProduct[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return false;
    }

    return true;
  };

  // Add this helper function to get the image URL
  const getImageUrl = (photo) => {
    if (!photo) return null;

    // If the photo is already a full URL, return it
    if (photo.startsWith("http")) return photo;

    // Otherwise, construct the URL using the API base URL
    return `${import.meta.env.VITE_API_URL}/${photo.replace(/\\/g, "/")}`;
  };

  const handleStockUpdate = async (productId, inStock) => {
    try {
      toast.loading("Updating stock status...", {
        position: "top-center",
        style: {
          background: "#3B82F6",
          color: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
        },
      });

      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://127.0.0.1:4000/api/v1/products/${productId}`,
        {
          inStock: inStock,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? { ...product, inStock: inStock }
              : product
          )
        );

        // Clear loading toast
        toast.dismiss();

        // Show success message
        toast.success(
          `✨ Product ${inStock ? "In Stock" : "Out of Stock"} ✨`,
          {
            duration: 3000,
            position: "top-center",
            style: {
              background: "#10B981",
              color: "#FFFFFF",
              padding: "16px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #064E3B",
            },
            icon: "🔄",
          }
        );
      }
    } catch (error) {
      console.error("Error updating stock status:", error);
      toast.dismiss();
      toast.error("Failed to update stock status", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
        },
      });
    }
  };

  // Update quantity change handler
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      toast.loading("Updating quantity...", {
        position: "top-center",
        style: {
          background: "#3B82F6",
          color: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
        },
      });

      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://127.0.0.1:4000/api/v1/products/${productId}`,
        {
          quantityInStock: Number(newQuantity),
          inStock: Number(newQuantity) > 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? {
                  ...product,
                  quantityInStock: Number(newQuantity),
                  inStock: Number(newQuantity) > 0,
                }
              : product
          )
        );

        toast.dismiss();
        toast.success("✨ Quantity Updated Successfully ✨", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#FFFFFF",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #064E3B",
          },
          icon: "📦",
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.dismiss();
      toast.error("Failed to update quantity", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
        },
      });
    }
  };

  // Update price change handler
  const handlePriceChange = async (productId, newPrice) => {
    try {
      toast.loading("Updating price...", {
        position: "top-center",
        style: {
          background: "#3B82F6",
          color: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
        },
      });

      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://127.0.0.1:4000/api/v1/products/${productId}`,
        {
          price: Number(newPrice),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? { ...product, price: Number(newPrice) }
              : product
          )
        );

        toast.dismiss();
        toast.success("✨ Price Updated Successfully ✨", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#FFFFFF",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #064E3B",
          },
          icon: "💰",
        });
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.dismiss();
      toast.error("Failed to update price", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
        },
      });
    }
  };

  // Edit Product Form Component
  const EditProductForm = ({ product, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      brand: product.brand || "",
      modelNumber: product.modelNumber || "",
      coolingCapacitiy: product.coolingCapacitiy || "",
      powerConsumption: product.powerConsumption || "",
      starRating: product.starRating || 1,
      price: product.price || 0,
      features: product.features || [],
      quantityInStock: product.quantityInStock || 0,
      photos: [],
    });

    const handleChange = (e) => {
      const { name, value, type } = e.target;

      if (type === "file") {
        setFormData((prev) => ({
          ...prev,
          photos: Array.from(e.target.files),
        }));
      } else if (name === "features") {
        // Handle features as an array
        const featuresArray = value
          .split(",")
          .map((feature) => feature.trim())
          .filter((feature) => feature !== "");

        setFormData((prev) => ({
          ...prev,
          features: featuresArray,
        }));
      } else if (type === "number") {
        // Ensure number fields are properly converted
        setFormData((prev) => ({
          ...prev,
          [name]: value === "" ? "" : Number(value),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(product._id, formData);
    };

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        toast.error("Maximum 5 photos allowed");
        e.target.value = ""; // Clear the input
        return;
      }
      setFormData((prev) => ({
        ...prev,
        photos: files,
      }));
    };

    return (
      <div className={styles.editForm}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Brand:</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Model Number:</label>
            <input
              type="text"
              name="modelNumber"
              value={formData.modelNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Cooling Capacity:</label>
            <input
              type="text"
              name="coolingCapacitiy"
              value={formData.coolingCapacitiy}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Power Consumption:</label>
            <input
              type="number"
              name="powerConsumption"
              value={formData.powerConsumption}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Star Rating:</label>
            <input
              type="number"
              name="starRating"
              value={formData.starRating}
              onChange={handleChange}
              min="1"
              max="5"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Quantity in Stock:</label>
            <input
              type="number"
              name="quantityInStock"
              value={formData.quantityInStock}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Features (comma-separated):</label>
            <textarea
              name="features"
              value={formData.features.join(", ")}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Photos (Max 5):</label>
            <input
              type="file"
              name="photos"
              onChange={handleFileChange}
              multiple
              accept="image/*"
              max="5"
            />
            <small>Current photos: {product.photos?.length || 0}</small>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              Update Product
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.manageProducts}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <h2 className={styles.pageTitle}>
            <FaBox style={iconStyle} />
            Product Management
          </h2>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <FaWarehouse style={iconStyle} />
              <div>
                <h4>Total Products</h4>
                <p>{products.length}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <FaCheckCircle style={iconStyle} />
              <div>
                <h4>In Stock</h4>
                <p>{products.filter((p) => p.inStock).length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.header}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search by brand, model, price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            className={styles.addNewButton}
            onClick={() => setShowAddForm(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Product
          </button>
        </div>
      </div>

      <div className={styles.toolBar}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <FaFilter style={iconStyle} />
            <select
              value={filterInStock}
              onChange={(e) => setFilterInStock(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Products</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          <button
            className={styles.sortButton}
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
          >
            <FaSortAmountDown style={iconStyle} />
            Price {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <FaSync className={styles.spinIcon} />
          <p>Loading products...</p>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <FaBox style={{ ...iconStyle, fontSize: "3rem" }} />
          <h3>No Products Found</h3>
          <p>
            {searchTerm
              ? "No products match your search"
              : "Start by adding your first product"}
          </p>
          <button
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            <FaRegPlusSquare style={iconStyle} />
            Add Product
          </button>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {displayedProducts.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.photos && product.photos.length > 0 ? (
                  <img
                    src={getImageUrl(product.photos[0])}
                    alt={`${product.brand} ${product.modelNumber}`}
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png"; // Add a placeholder image
                      e.target.onerror = null; // Prevent infinite loop
                    }}
                  />
                ) : (
                  <div className={styles.noImage}>
                    <FaImage />
                    <p>No image available</p>
                  </div>
                )}
              </div>

              <div className={styles.productInfo}>
                <h3>
                  {product.brand} - {product.modelNumber}
                </h3>
                <p>Price: ${product.price}</p>
                <p>Stock: {product.quantityInStock}</p>
                <div className={styles.stockToggle}>
                  <label>
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={(e) =>
                        handleStockUpdate(product._id, e.target.checked)
                      }
                    />
                    In Stock
                  </label>
                </div>
                {product.powerConsumption && (
                  <p>Power: {product.powerConsumption}W</p>
                )}
              </div>

              <div className={styles.productActions}>
                <button
                  onClick={() => setEditingProduct(product)}
                  className={styles.editButton}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className={styles.deleteButton}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className={styles.pagination}>
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
        </div>
      )}

      {/* Edit/Add Modal */}
      {(editingProduct || showAddForm) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>
                {editingProduct ? (
                  <>
                    <FaRegEdit style={iconStyle} /> Edit Product
                  </>
                ) : (
                  <>
                    <FaRegPlusSquare /> Add New Product
                  </>
                )}
              </h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setEditingProduct(null);
                  setShowAddForm(false);
                }}
              >
                <FaTimes />
              </button>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <FaExclamationCircle /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={newProduct.brand}
                    onChange={handleInputChange}
                    required
                    minLength="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Model Number *</label>
                  <input
                    type="text"
                    name="modelNumber"
                    value={newProduct.modelNumber}
                    onChange={handleInputChange}
                    required
                    minLength="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Power Consumption (W) *</label>
                  <input
                    type="number"
                    name="powerConsumption"
                    value={newProduct.powerConsumption}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Cooling Capacity *</label>
                  <input
                    type="text"
                    name="coolingCapacity"
                    value={newProduct.coolingCapacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Quantity in Stock *</label>
                  <input
                    type="number"
                    name="quantityInStock"
                    value={newProduct.quantityInStock}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Product Photos (Max 5)</label>
                  <input
                    type="file"
                    name="photos"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className={styles.fileInput}
                  />
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={newProduct.inStock}
                    onChange={handleInputChange}
                  />
                  <label>In Stock</label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit Product</h2>
            <EditProductForm
              product={editingProduct}
              onSubmit={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
