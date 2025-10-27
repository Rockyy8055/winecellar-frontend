import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PricingBifurcation.css';

const PricingBifurcation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalPrice, vat, deliveryCharges, finalPrice } = location.state || {};

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}payment/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Math.round(finalPrice) }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/payment', { state: { paymentIntent: data } });
      } else {
        // Handle error
        console.error('Error creating payment intent:', data);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="pricing-container">
      <h2>Pricing Bifurcation</h2>
      <p>Total Price: £{totalPrice.toFixed(2)}</p>
      <p>VAT (20%): £{vat.toFixed(2)}</p>
      <p>Delivery Charges: £{deliveryCharges.toFixed(2)}</p>
      <p>Final Price: £{finalPrice.toFixed(2)}</p>
     <button onClick={handleSubmit}>Continue to Payment</button>
    </div>
  );
};

export default PricingBifurcation;

