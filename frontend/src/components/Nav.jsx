import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import "./Nav.css";
import logo from '../assets/logoAC.png'; // Adjust the path as necessary
import cartlogo from '../assets/cartlogo.png'; // Ensure this path is correct
import aboutlogo from '../assets/aboutas.png'; // Ensure this path is correct
import userlogo from '../assets/user.png'; // Ensure this path is correct
import Search from './Search';

export default function Nav() {
  const [click, setClick] = useState(false)

  const handleClick = () => {
    setClick(!click)
  }

  return (
    <nav className="header">
      <div className="container">
        <Link to="/home">
          <img className="logo" src={logo} alt="Company Logo" />
        </Link>
        <div className="hamburger" onClick={handleClick} aria-label="Toggle navigation">
          {click ? (
            <FaTimes size={20} style={{ color: "#333" }} />
          ) : (
            <FaBars size={20} style={{ color: "#333" }} />
          )}
        </div>
        <Search/>
        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li>
            <Link to="/profile" aria-label="User Profile">
              <img className="nav-icon" src={userlogo} alt="User Profile" />
            </Link>
          </li>
          <li>
            <Link to="/cart" aria-label="Shopping Cart">
              <img className="nav-icon" src={cartlogo} alt="Cart" />
            </Link>
          </li>
          <li>
            <Link to="/about" aria-label="About Us">
              <img className="nav-icon" src={aboutlogo} alt="About" />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

