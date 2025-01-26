import React, { useEffect, useState } from 'react';
import { userService } from '../services/api';

const ServerStatus = () => {
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        const checkServer = async () => {
            const isConnected = await userService.testConnection();
            setStatus(isConnected ? 'connected' : 'disconnected');
        };

        checkServer();
        const interval = setInterval(checkServer, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    if (status === 'checking' || status === 'connected') return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px',
            backgroundColor: '#ff4444',
            color: 'white',
            borderRadius: '5px',
            zIndex: 1000
        }}>
            Server is not responding. Please check if it's running.
        </div>
    );
};

export default ServerStatus; 