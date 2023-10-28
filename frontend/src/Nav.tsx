import React from 'react';
import { Link } from 'react-router-dom';

const Nav: React.FC = () => {
    return (
        <nav className="bg-gray-800 p-4 text-white">
            <div className="container mx-auto">
                <ul className="flex space-x-4">
                    <li><Link to="/">Account: {localStorage.getItem('login')}</Link></li>
                    {/* <li><Link to="/account">Account</Link></li> */}
                    {/* Add other navigation links as needed */}
                </ul>
            </div>
        </nav>
    );
};

export default Nav;