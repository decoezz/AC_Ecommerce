import React, { useEffect, useState } from "react";
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
} from "react-icons/fa";

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
  const [searchBrand, setSearchBrand] = useState("");
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
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
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
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchBrand);
  };

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
        setProducts((prev) => [...prev, response.data]);
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

  const handleEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !editingProduct) return;

    try {
      // Create a new object with only the allowed fields and validate quantity
      const updates = {};
      if (editingProduct.brand) updates.brand = editingProduct.brand;
      if (editingProduct.modelNumber)
        updates.modelNumber = editingProduct.modelNumber;
      if (editingProduct.powerConsumption)
        updates.powerConsumption = editingProduct.powerConsumption;
      if (editingProduct.price) updates.price = Number(editingProduct.price);
      if (editingProduct.quantityInStock) {
        const quantity = Number(editingProduct.quantityInStock);
        if (quantity > 500) {
          setError("Quantity can't be more than 500");
          return;
        }
        updates.quantityInStock = quantity;
      }
      updates.inStock = editingProduct.inStock;

      // Remove coolingCapacity as it's not allowed in updates
      // if (editingProduct.coolingCapacity) updates.coolingCapacity = editingProduct.coolingCapacity;

      console.log("Sending update:", updates);

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/products/${editingProduct._id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setEditingProduct(null);
      fetchProducts();
      setError("");
    } catch (err) {
      console.error("Update error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update product.");
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
        <button
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          <FaRegPlusSquare style={iconStyle} />
          Add New Product
        </button>
      </div>

      <div className={styles.toolBar}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchBrand}
            onChange={(e) => setSearchBrand(e.target.value)}
          />
        </div>

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
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>
          <FaBox style={{ ...iconStyle, fontSize: "3rem" }} />
          <h3>No Products Found</h3>
          <p>Start by adding your first product</p>
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
          {currentItems.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.cardHeader}>
                <h3>{product.brand}</h3>
                <span
                  className={
                    product.inStock
                      ? styles.statusBadgeInStock
                      : styles.statusBadgeOutStock
                  }
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className={styles.productImages}>
                {product.images && product.images.length > 0 ? (
                  <div className={styles.imageGallery}>
                    {product.images.map((image, index) => (
                      <div key={index} className={styles.imageContainer}>
                        <img
                          src={image.url}
                          alt={`${product.brand} ${index + 1}`}
                        />
                        <button
                          onClick={() =>
                            handleDeleteImage(product._id, image.public_id)
                          }
                          className={styles.deleteImageBtn}
                        >
                          <FaRegTrashAlt />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noImage}>
                    <FaCamera style={{ ...iconStyle, fontSize: "2rem" }} />
                    <p>No images available</p>
                  </div>
                )}
              </div>

              <div className={styles.productDetails}>
                <div className={styles.detailRow}>
                  <FaBarcode style={iconStyle} />
                  <span>{product.modelNumber}</span>
                </div>
                <div className={styles.detailRow}>
                  <FaBolt style={iconStyle} />
                  <span>{product.powerConsumption}W</span>
                </div>
                <div className={styles.detailRow}>
                  <FaRegMoneyBillAlt style={iconStyle} />
                  <span>${product.price.toLocaleString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <FaWarehouse style={iconStyle} />
                  <span>{product.quantityInStock} units</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => setEditingProduct(product)}
                  className={styles.editButton}
                >
                  <FaRegEdit style={iconStyle} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className={styles.deleteButton}
                >
                  <FaRegTrashAlt style={iconStyle} />
                  Delete
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
    </div>
  );
};

export default ManageProducts;
