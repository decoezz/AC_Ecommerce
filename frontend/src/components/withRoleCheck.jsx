import React from 'react';
import { Navigate } from 'react-router-dom';

const withRoleCheck = (WrappedComponent, allowedRoles) => {
    return (props) => {
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;

        // If user is not logged in or role is not allowed, redirect to Not Found
        if (!user || !allowedRoles.includes(user.role)) {
            return <Navigate to="/not-found" />;
        }

        return <WrappedComponent {...props} />;
    };
};

export default withRoleCheck; 