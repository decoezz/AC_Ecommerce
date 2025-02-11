import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaInfoCircle,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./Nav.css";
import logo from "../assets/logoAC.png"; // Adjust the path as necessary
import cartlogo from "../assets/cartlogo.png"; // Ensure this path is correct
import aboutlogo from "../assets/aboutas.png"; // Ensure this path is correct
import userlogo from "../assets/user.png"; // Ensure this path is correct
import Search from "./Search";

export default function Nav() {
  const [click, setClick] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle menu click
  const handleClick = () => {
    setClick(!click);
  };

  // Close mobile menu
  const closeMobileMenu = () => setClick(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if the link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Link to="/shop" className="logo-container" onClick={closeMobileMenu}>
          <img className="logo" src={logo} alt="AC Shop Logo" />
        </Link>
        <div
          className="hamburger"
          onClick={handleClick}
          aria-label="Toggle navigation"
          role="button"
          tabIndex={0}
        >
          {click ? (
            <FaTimes size={24} className="menu-icon" />
          ) : (
            <FaBars size={24} className="menu-icon" />
          )}
        </div>

        {/*<Search /> */}

        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li className={isActive("/profile") ? "active" : ""}>
            <Link
              to="/profile"
              className="nav-link"
              onClick={closeMobileMenu}
              aria-label="User Profile"
            >
              <div className="nav-item">
                <img className="nav-icon" src={userlogo} alt="" />
                <span className="nav-text">Profile</span>
              </div>
            </Link>
          </li>
          <li className={isActive("/cart") ? "active" : ""}>
            <Link
              to="/cart"
              className="nav-link"
              onClick={closeMobileMenu}
              aria-label="Shopping Cart"
            >
              <div className="nav-item">
                <img className="nav-icon" src={cartlogo} alt="" />
                <span className="nav-text">Cart</span>
              </div>
            </Link>
          </li>
          <li className={isActive("/about") ? "active" : ""}>
            <Link
              to="/about"
              className="nav-link"
              onClick={closeMobileMenu}
              aria-label="About Us"
            >
              <div className="nav-item">
                <img className="nav-icon" src={aboutlogo} alt="" />
                <span className="nav-text">About</span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
