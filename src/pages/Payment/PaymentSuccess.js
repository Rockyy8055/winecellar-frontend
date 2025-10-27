import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentIntent } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000); // Redirect after 10 seconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [navigate]);

  return (
    <div>
      <h2>Payment Success</h2>
      {paymentIntent ? (
        <div>
          <p>Payment Intent ID: {paymentIntent.id}</p>
          <p>Amount: {paymentIntent.amount}</p>
          <p>Status: {paymentIntent.status}</p>
        </div>
      ) : (
        <p>No payment details found.</p>
      )}
       <p>Redirecting to home page in 10 seconds...</p>
    </div>
  );
};

export default PaymentSuccess;

