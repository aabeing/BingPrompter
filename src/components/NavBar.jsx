import React from 'react';
import './Navbar.css';
import { Dropdown } from './Dropdown';

const Navbar = (props) => {
    return (
        <div className="navbar">
            {props.children}
        </div>
    );
};

export { Navbar };