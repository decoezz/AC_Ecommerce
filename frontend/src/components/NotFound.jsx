import React from 'react';
import './NotFound.css'; // Ensure this CSS file is correctly linked
import astronaut from '../assets/astronaut.svg'; // Adjust the path as necessary
import planet from '../assets/planet.svg'; // Adjust the path as necessary
import { Link } from 'react-router-dom'; // Import Link for navigation

const NotFound = () => {
    return (
        <div className="permission_denied">
            <div id="tsparticles"></div>
            <div className="denied__wrapper">
                <h1>404</h1>
                <h3>
                    LOST IN <span>SPACE</span>? Hmm, looks like that page doesn't exist.
                </h3>
                <img id="astronaut" src={astronaut} alt="Astronaut" />
                <img id="planet" src={planet} alt="Planet" />
                <Link to="/">
                    <button className="denied__link">Go Home</button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound; 

