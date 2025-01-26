import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ManageProducts.module.css';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [newProduct, setNewProduct] = useState({
        brand: '',
        modelNumber: '',
        powerConsumption: '',
        price: '',
        inStock: false,
        quantityInStock: '',
        coolingCapacity: '',
    });

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProducts(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch products.');
            }
        };

        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/products`, newProduct, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNewProduct({
                brand: '',
                modelNumber: '',
                powerConsumption: '',
                price: '',
                inStock: false,
                quantityInStock: '',
                coolingCapacity: '',
            });
            // Refresh product list
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product.');
        }
    };

    return (
        <div className={styles.manageProducts}>
            <h2>Manage Products</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="brand" placeholder="Brand" value={newProduct.brand} onChange={handleInputChange} required />
                <input type="text" name="modelNumber" placeholder="Model Number" value={newProduct.modelNumber} onChange={handleInputChange} required />
                <input type="text" name="powerConsumption" placeholder="Power Consumption" value={newProduct.powerConsumption} onChange={handleInputChange} required />
                <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleInputChange} required />
                <input type="checkbox" name="inStock" checked={newProduct.inStock} onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })} />
                <input type="number" name="quantityInStock" placeholder="Quantity In Stock" value={newProduct.quantityInStock} onChange={handleInputChange} required />
                <input type="text" name="coolingCapacity" placeholder="Cooling Capacity" value={newProduct.coolingCapacity} onChange={handleInputChange} required />
                <button type="submit">Add Product</button>
            </form>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>{product.brand} - {product.modelNumber}</li>
                ))}
            </ul>
        </div>
    );
};

export default ManageProducts; 