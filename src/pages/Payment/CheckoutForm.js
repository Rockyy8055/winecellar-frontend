// filepath: /d:/WineCeller/wineseller_website_frontend/src/pages/Payment/CheckoutForm.js
import React, { useState,useEffect } from 'react';
import { useStripe,useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import './CheckoutForm.css';

const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);


  useEffect(() => {
    const validatePaymentIntent = async () => {
      if (!stripe || !clientSecret) {
        return;
      }

      if (error) {
        setError(`Failed to retrieve payment intent: ${error.message}`);
      }
    };

    validatePaymentIntent();
  }, [stripe, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    const shippingDetails = JSON.parse(localStorage.getItem('shippingDetails'));


    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        client_secret: clientSecret,
        payment_method_data: {
          billing_details: {
            name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
            email: shippingDetails.email,
            address: {
              line1: shippingDetails.addressLine1,
              line2: shippingDetails.addressLine2,
              city: shippingDetails.city,
              postal_code: shippingDetails.postalCode,
              country: shippingDetails.country,
            },
          },
        },
      },
      redirect: 'if_required',
    });

    if(paymentIntent){
      const paymentDetails = {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_method: paymentIntent.payment_method_types[0],
        status: paymentIntent.status,
        receipt_Id: paymentIntent.charges.data[0].id,
        metadata: paymentIntent.metadata,
        created: paymentIntent.created,
      };

      await fetch(`${process.env.REACT_APP_API_URL}payment/Payment-confirmation`,  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentDetails),
      });
    }

    if (error) {
      setError(`Payment failed: ${error.message}`);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      localStorage.removeItem('cartProducts');
      navigate('/payment-success', { state: { paymentIntent } });
    }else {
      setError('Payment intent is invalid or not found.');
      setProcessing(false);
    }
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || processing || succeeded} className="payment-button">
        {processing ? 'Processing...' : 'Pay'}
      </button>
      {error && <div className="payment-error">{error}</div>}
      {succeeded && <div className="payment-success">Payment succeeded!</div>}
    </form>
  );
};

export default CheckoutForm;

