import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CreateAccount from './components/CreateAccount';
import AllUsers from './components/AllUsers';
import NotFound from './components/NotFound';
import Login from './components/Login';
import Main from "./components/Main.jsx"
import AdminHome from './components/AdminHome';
import CreateEmployee from './components/CreateEmployee';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/create-employee" element={<CreateEmployee />} />
        <Route path="/users" element={<AllUsers />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App


