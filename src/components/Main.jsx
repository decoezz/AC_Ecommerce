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
import '../styles/global.css';

export default function Main() {
  return (
    <IconContext.Provider value={{ color: "white", size: "2.5rem" }}>
      <Router>
        <div className="App">
          <Nav />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </IconContext.Provider>
  );
}
