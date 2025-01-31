import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:4000/api/v1/products/?brand=Samsung")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API Response:", data); // Debugging
                if (data && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else {
                    setError("Unexpected API response format");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError("Failed to load products");
                setLoading(false);
            });
    }, []);

    return (
        <div className={styles.home}>
            <h1 className={styles.home__title}>Welcome to Our E-Commerce Site</h1>
            <p className={styles.home__description}>
                Thank you for visiting our e-commerce site. Browse our latest products below:
            </p>

            {loading && <p>Loading products...</p>}
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.products__grid}>
                {Array.isArray(products) && products.length > 0 ? (
                    products.map(product => (
                        <div key={product.id} className={styles.product__card}>
                            <img src={product.image} alt={product.name} className={styles.product__image} />
                            <h3 className={styles.product__title}>{product.name}</h3>
                            <p className={styles.product__price}>${product.price}</p>
                            <Link to={`/product/${product.id}`} className={styles.product__button}>View Details</Link>
                        </div>
                    ))
                ) : (
                    !loading && <p>No products found.</p>
                )}
            </div>
        </div>
    );
};

export default Home;
