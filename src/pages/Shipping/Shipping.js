// filepath: /d:/WineCeller/wineseller_website_frontend/src/pages/Single Pages/Shipping.js
import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import './Shipping.css';

const Shipping = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const totalPrice = location.state?.totalPrice || 0;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Store shipping details in localStorage
    const shippingDetails = {
      firstName,
      lastName,
      mobile,
      email,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country,
    };
    localStorage.setItem('shippingDetails', JSON.stringify(shippingDetails));
    const vat = totalPrice * 0.2;
    const deliveryCharges = 20;
    const finalPrice = totalPrice + vat + deliveryCharges;

    navigate('/pricing-bifurcation', {
      state: { totalPrice, vat, deliveryCharges, finalPrice },
    });
  };

  return (
    <div className="shipping-container">
      <form onSubmit={handleSubmit} className="shipping-form">
        <h2>Shipping Information</h2>
        <label>
          First Name:
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        <label>
          Last Name:
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        <label>
          Mobile:
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Address Line 1:
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
          />
        </label>
        <label>
          Address Line 2:
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
        </label>
        <label>
          City:
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </label>
        <label>
          Postal Code:
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </label>
        <label>
          Country:
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </label>
        <button type="submit">
          Continue
        </button>
      </form>
    </div>
  );
};

export default Shipping;

