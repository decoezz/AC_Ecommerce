import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { IconContext } from "react-icons"
import Nav from "./components/Nav.jsx"
import NotFound from "./components/NotFound.jsx"
import Cart from "./components/Cart.jsx"
import Contact from "./components/Contact.jsx"
import About from "./components/About.jsx"
import Home from "./components/Home.jsx"
import Login from "./components/Login.jsx"
import CreateAccount from "./components/CreateAccount.jsx"

function App() {
  return (
    <IconContext.Provider value={{ color: "white", size: "2.5rem" }}>
      <Router>
        <div className="App">
          <Nav />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </IconContext.Provider>
  );
}

export default App


