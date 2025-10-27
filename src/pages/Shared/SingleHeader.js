import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/Home');
  };

  return (
    <header className="wishlist-header">
      <button className="home-button" onClick={handleHomeClick}>Home</button>
    </header>
  );
};

export default Header;

