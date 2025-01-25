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
    <div className="header">
      <div className="container">
        <Link to="/home"><img className="logo" src={logo} alt="logo" /></Link>
        <div className="hamburger" onClick={handleClick}>
          {click ? (
            <FaTimes size={20} style={{ color: "#333" }} />
          ) : (
            <FaBars size={20} style={{ color: "#333" }} />
          )}
        </div>
        <Search/>
        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li>
            <Link to="/contact">
              <img className="cart-logo" src={userlogo} alt="user" />
            </Link>
          </li>
          <li>
            <Link to="/cart">
              <img className="cart-logo" src={cartlogo} alt="Cart" />
            </Link>
          </li>
          <li>
            <Link to="/about">
              <img className="cart-logo" src={aboutlogo} alt="about" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

