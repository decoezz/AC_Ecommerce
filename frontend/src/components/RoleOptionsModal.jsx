import React from 'react';
import './RoleOptionsModal.css'; // Optional: for styling

const RoleOptionsModal = ({ isOpen, onClose, role }) => {
    if (!isOpen) return null;

    const options = {
        admin: ['Manage Users', 'View Reports', 'Settings'],
        user: ['Profile Settings', 'Order History'],
        // Add more roles and their options as needed
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Options for {role}</h3>
                <ul>
                    {options[role]?.map((option, index) => (
                        <li key={index}>{option}</li>
                    ))}
                </ul>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default RoleOptionsModal; 