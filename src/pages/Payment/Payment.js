import React from 'react';
import { useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const Payment = () => {
  const location = useLocation();
  const { paymentIntent } = location.state || {};

 

  const options = {
    clientSecret: paymentIntent?.clientSecret,
  };
  if (!paymentIntent) {
    return <p>No payment intent found.</p>;
  }

  return (
    <div>
      <h2>Payment Page</h2>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm clientSecret={paymentIntent.client_secret} />
      </Elements>
    </div>
  );
};

export default Payment;

