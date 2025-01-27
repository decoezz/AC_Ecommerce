import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { IconContext } from "react-icons";
import Nav from "./Nav.jsx";
import NotFound from "./NotFound.jsx";
import Cart from "./Cart.jsx";
import Contact from "./Userop.jsx";
import About from "./About.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import CreateAccount from "./CreateAccount.jsx";
import UserProfile from "./UserProfile.jsx";
import AllUsers from "./AllUsers.jsx";
import ManageProducts from "./ManageProducts.jsx";
import ViewOrders from "./ViewOrders.jsx";
import UserHome from "./UserHome.jsx";
import AdminHome from "./AdminHome.jsx";
import EmployeeHome from "./EmployeeHome.jsx";
import '../styles/global.css';

export default function Main() {
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  console.log("User Data:", userData);
  console.log("Parsed User:", user);

  return (
    <IconContext.Provider value={{ color: "white", size: "2.5rem" }}>
      <Router>
        <div className="App">
          <Nav />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/users" element={<AllUsers />} />
              <Route path="/shop" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/manage-products" element={<ManageProducts />} />
              <Route path="/view-orders" element={<ViewOrders />} />
              <Route path="/user-home" element={<UserHome />} />
              <Route path="/admin-home" element={<AdminHome/>} />
              <Route path="/employee-home" element={<EmployeeHome />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </IconContext.Provider>
  );
}

