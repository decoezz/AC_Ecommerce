import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { IconContext } from "react-icons"
import Nav from "./components/Nav.jsx"
import NotFound from "./components/NotFound.jsx"
import Featured from "./components/Featured.jsx"
import Cart from "./components/Cart.jsx"
import Contact from "./components/Contact.jsx"
import Shop from "./components/Shop.jsx"
import About from "./components/About.jsx"

function App() {

  return (
    <Router>
      <div className="App">
        <Nav/>
        <Routes>
          <Route path="/" element={<h2>Home Page</h2>} />
          <Route path="/featured" element={<Featured />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App

