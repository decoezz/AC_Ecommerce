import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import CreateAccount from './components/CreateAccount';
import AllUsers from './components/AllUsers';
import NotFound from './components/NotFound';
import Login from './components/Login';
import Main from "./components/Main.jsx"
import AdminHome from './components/AdminHome';
import CreateEmployee from './components/CreateEmployee';
import SearchUser from './components/SearchUser';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Main />
  );
};

export default App


