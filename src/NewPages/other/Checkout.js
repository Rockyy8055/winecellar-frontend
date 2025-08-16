import { Fragment, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../layouts/Layout";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createOrder } from '../../Services/orders-api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StripePaymentForm = ({ onSuccess, canPay }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    if (!stripe || !elements) return;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: "if_required",
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      setSucceeded(true);
      setProcessing(false);
      try {
        const id = paymentIntent?.id || `pi_${Date.now()}`;
        if (onSuccess) onSuccess(id);
      } catch (_) {}
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', background: '#fff' }}>
        <PaymentElement />
      </div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {succeeded && <div style={{ color: 'green', marginBottom: '10px' }}>Payment successful!</div>}
      {!canPay && (
        <div style={{ color: '#b12704', marginBottom: 10, fontWeight: 600 }}>
          Enter a valid UK postcode in Billing Details to proceed.
        </div>
      )}
      <button
        type="submit"
        disabled={processing || !stripe || !elements || !canPay}
        style={{
          background: '#111',
          color: '#fff',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const CODForm = ({ onPlaceOrder }) => (
  <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
    <p style={{ fontWeight: 600, marginBottom: 16 }}>You have selected <b>Cash on Delivery</b>.</p>
    <button
      onClick={onPlaceOrder}
      style={{
        background: '#111',
        color: '#fff',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '100%'
      }}
    >
      Place Order (COD)
    </button>
  </div>
);

const NEFTForm = () => (
  <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
    <p style={{ fontWeight: 600, marginBottom: 16 }}>You have selected <b>NEFT/IMPS Bank Transfer</b>.</p>
    <div style={{ marginBottom: 12 }}>
      <b>Bank Name:</b> HDFC Bank<br />
      <b>Account Number:</b> 1234567890<br />
      <b>IFSC:</b> HDFC0001234<br />
      <b>Account Holder:</b> Wine Seller Pvt Ltd<br />
    </div>
    <p style={{ color: '#666', fontSize: 14 }}>After payment, please email your transaction details to <b>info@wineseller.com</b> for order confirmation.</p>
  </div>
);

const Checkout = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency);
  const [totalAmount, setTotalAmount] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('card'); // default to card
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paypalPaid, setPaypalPaid] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shipping, setShipping] = useState(0);
  // Billing form state
  const [billing, setBilling] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', postcode: '' });
  const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i;
  const isUKPostcode = (pc) => ukPostcodeRegex.test(String(pc || '').trim());
  const isBillingComplete = Object.values(billing).every(v => String(v || '').trim().length > 0) && isUKPostcode(billing.postcode);
  const elementsOptions = useMemo(() => (
    clientSecret ? { clientSecret, appearance: { theme: 'stripe' } } : undefined
  ), [clientSecret]);

  useEffect(() => {
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += item.price * item.quantity;
    });
    const vat = subtotal * 0.20; // 20% VAT
    const shippingFee = subtotal >= 100 ? 0 : 4.99;
    setVatAmount(vat);
    setShipping(shippingFee);
    setTotalAmount(subtotal + vat + shippingFee);
  }, [cartItems]);

  useEffect(() => {
    if (totalAmount > 0 && paymentMethod === 'card') {
      const url = `${process.env.REACT_APP_API_URL}/api/create-payment-intent`;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount, currency: "gbp" })
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Stripe intent failed (${res.status}): ${text}`);
          }
          return res.json();
        })
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => {
          console.error("Create PaymentIntent error:", err);
          setClientSecret("");
        });
    }
  }, [totalAmount, paymentMethod]);

  const handlePlaceOrderCOD = async () => {
    if (!isBillingComplete) {
      alert('Please fill the Billing Details.');
      return;
    }
    try {
      const payload = {
        method: 'cod',
        customer: { name: `${billing.firstName} ${billing.lastName}`.trim(), email: billing.email, phone: billing.phone },
        shippingAddress: { line1: billing.address, postcode: billing.postcode },
        items: cartItems.map(it => ({ id: it.ProductId, name: it.name, qty: it.quantity, price: it.price })),
        total: Number(totalAmount.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
      };
      const { trackingCode } = await createOrder(payload);
      setOrderPlaced(true);
      const newId = trackingCode || `ORD-${Date.now()}`;
      setOrderId(newId);
      try { 
        localStorage.setItem('last_order_id', newId);
        localStorage.setItem('last_tracking_code', newId);
      } catch (_) {}
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    }
  };

  // PayPal client ID should be set in .env and passed here
  const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || "test";

  return (
    <Fragment>
      <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
        <div className="checkout-area pt-95 pb-100">
          <div className="container-fluid" style={{ paddingLeft: 40, paddingRight: 40 }}>
            {cartItems && cartItems.length >= 1 ? (
              <div className="row">
                <div className="col-lg-9 col-md-8 col-12">
                  <div className="billing-info-wrap" style={{ fontSize: '1.35rem' }}>
                    <h3 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 16 }}>Billing Details</h3>
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <div className="billing-info mb-20">
                          <label style={{ fontWeight: 800, fontSize: '1.25rem' }}>First Name</label>
                          <input type="text" value={billing.firstName} onChange={(e)=>setBilling({ ...billing, firstName: e.target.value })} style={{ fontSize: '1.2rem', padding: '16px 18px', height: 'auto' }} />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6">
                        <div className="billing-info mb-20">
                          <label style={{ fontWeight: 800, fontSize: '1.25rem' }}>Last Name</label>
                          <input type="text" value={billing.lastName} onChange={(e)=>setBilling({ ...billing, lastName: e.target.value })} style={{ fontSize: '1.2rem', padding: '16px 18px', height: 'auto' }} />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="billing-info mb-20">
                          <label style={{ fontWeight: 800, fontSize: '1.25rem' }}>Email Address</label>
                          <input type="email" value={billing.email} onChange={(e)=>setBilling({ ...billing, email: e.target.value })} style={{ fontSize: '1.2rem', padding: '16px 18px', height: 'auto' }} />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="billing-info mb-20">
                          <label style={{ fontWeight: 800, fontSize: '1.25rem' }}>Phone</label>
                          <input type="text" value={billing.phone} onChange={(e)=>setBilling({ ...billing, phone: e.target.value })} style={{ fontSize: '1.2rem', padding: '16px 18px', height: 'auto' }} />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="billing-info mb-20">
                          <label style={{ fontWeight: 800, fontSize: '1.25rem' }}>Address</label>
                          <input type="text" value={billing.address} onChange={(e)=>setBilling({ ...billing, address: e.target.value })} style={{ fontSize: '1.2rem', padding: '16px 18px', height: 'auto' }} />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6">
                        <div className="billing-info mb-20">
                          <label style={{ fontWeight: 800, fontSize: '1.25rem' }}>Postcode</label>
                          <input type="text" value={billing.postcode} onChange={(e)=>setBilling({ ...billing, postcode: e.target.value })} style={{ fontSize: '1.2rem', padding: '16px 18px', height: 'auto' }} />
                          {!isUKPostcode(billing.postcode) && billing.postcode.trim() !== '' && (
                            <div style={{ color: '#b12704', marginTop: 6, fontWeight: 600 }}>Enter a valid UK Postcode</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Divider line before Payment under Billing */}
                  <hr style={{ borderTop: '2px solid #e5e5e5', margin: '24px 0' }} />
                  {/* Payment Method Selector - Moved under Billing */}
                  <div className="payment-section mt-25" style={{ fontSize: '1.2rem', maxWidth: 1280 }}>
                    <h4 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Payment</h4>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                      {/* Left: options */}
                      <div style={{ width: 520 }}>
                        <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 24, marginBottom: 12 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 20, border: paymentMethod === 'card' ? '2px solid #111' : '1px solid #ccc', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', background: paymentMethod === 'card' ? '#f7f7f7' : '#fff' }}>
                              <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ width: 16, height: 16, accentColor: '#350008', margin: 0 }} />
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
                                Credit / Debit Card
                                <img src="https://img.icons8.com/color/32/000000/visa.png" alt="Visa" style={{ height: 20 }} />
                                <img src="https://img.icons8.com/color/32/000000/mastercard-logo.png" alt="Mastercard" style={{ height: 20 }} />
                                <img src="https://img.icons8.com/color/32/000000/amex.png" alt="Amex" style={{ height: 20 }} />
                              </span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 20, border: paymentMethod === 'paypal' ? '2px solid #111' : '1px solid #ccc', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', background: paymentMethod === 'paypal' ? '#f7f7f7' : '#fff' }}>
                              <input type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} style={{ width: 16, height: 16, accentColor: '#350008', margin: 0 }} />
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
                                PayPal
                                <img src="https://img.icons8.com/color/32/000000/paypal.png" alt="PayPal" style={{ height: 20 }} />
                              </span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 20, border: paymentMethod === 'cod' ? '2px solid #111' : '1px solid #ccc', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', background: paymentMethod === 'cod' ? '#f7f7f7' : '#fff' }}>
                              <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ width: 16, height: 16, accentColor: '#350008', margin: 0 }} />
                              <span style={{ lineHeight: 1 }}>Pick and Pay</span>
                            </label>
                          </div>
                        </div>
                        {paymentMethod === 'cod' && !orderPlaced && (
                          <div style={{ textAlign: 'left', marginTop: 8 }}>
                            <button onClick={handlePlaceOrderCOD} style={{ background: '#111', color: '#fff', padding: '16px 28px', border: 'none', borderRadius: 8, fontSize: 18, cursor: 'pointer', width: '100%' }}>
                              Place Order (Pick and Pay)
                            </button>
                          </div>
                        )}
                        {paymentMethod === 'cod' && orderPlaced && (
                          <div style={{ color: 'green', fontWeight: 600, textAlign: 'left', margin: '18px 0' }}>
                            Order placed successfully! You will pay on pickup.
                          </div>
                        )}
                      </div>
                      {/* Right: dynamic payment form */}
                      <div style={{ flex: 1, minWidth: 520 }}>
                        {paymentMethod === 'card' && clientSecret && (
                          <Elements stripe={stripePromise} options={elementsOptions} key={clientSecret}>
                            <StripePaymentForm canPay={isBillingComplete} onSuccess={(id) => { setOrderId(id); try { localStorage.setItem('last_order_id', id); localStorage.setItem('last_tracking_code', id);} catch (_) {} }} />
                          </Elements>
                        )}
                        {paymentMethod === 'paypal' && (
                          <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "GBP" }}>
                            <div style={{ maxWidth: 640 }}>
                              <PayPalButtons
                                style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' }}
                                createOrder={(data, actions) => {
                                  return actions.order.create({
                                    purchase_units: [{ amount: { value: totalAmount.toFixed(2), currency_code: "GBP" } }]
                                  });
                                }}
                                onApprove={(data, actions) => {
                                  return actions.order.capture().then(() => { setPaypalPaid(true); const id = data?.orderID || `PP-${Date.now()}`; setOrderId(id); try { localStorage.setItem('last_order_id', id); localStorage.setItem('last_tracking_code', id);} catch (_) {} });
                                }}
                              />
                              {paypalPaid && (
                                <div style={{ color: 'green', fontWeight: 600, textAlign: 'left', margin: '18px 0' }}>
                                  Payment successful via PayPal!
                                </div>
                              )}
                            </div>
                          </PayPalScriptProvider>
                        )}
                        {orderId && (
                          <div style={{ marginTop: 12 }}>
                            <Link to={`/order-status?trackingCode=${encodeURIComponent(orderId)}`} style={{ background: '#350008', color: '#fffef1', padding: '12px 18px', borderRadius: 6, display: 'inline-block', textDecoration: 'none' }}>
                              Track Order
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-4 col-12">
                  <div className="your-order-area" style={{ fontSize: '1.2rem' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Order</h3>
                    <div className="your-order-wrap gray-bg-4">
                      <div className="your-order-product-info" style={{ fontSize: '1.15rem' }}>
                        <div className="your-order-top" style={{ fontSize: '1.2rem' }}>
                          <ul>
                            <li>Product</li>
                            <li>Total</li>
                          </ul>
                        </div>
                        <div className="your-order-middle" style={{ fontSize: '1.15rem' }}>
                          <ul>
                            {cartItems.map((item, key) => (
                              <li key={key}>
                                <span className="order-middle-left">
                                  {item.name} X {item.quantity}
                                </span>
                                <span className="order-price">
                                  {currency.currencySymbol + (item.price * item.quantity).toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="your-order-total" style={{ fontSize: '1.3rem' }}>
                          <ul>
                            <li style={{ fontWeight: 700 }}>VAT (20%)</li>
                            <li style={{ fontWeight: 700 }}>{currency.currencySymbol + vatAmount.toFixed(2)}</li>
                          </ul>
                          <ul>
                            <li style={{ fontWeight: 700 }}>Shipping</li>
                            <li style={{ fontWeight: 700 }}>{shipping === 0 ? 'FREE' : (currency.currencySymbol + shipping.toFixed(2))}</li>
                          </ul>
                          <ul>
                            <li className="order-total" style={{ fontSize: '1.6rem', fontWeight: 900 }}>Total (incl. VAT)</li>
                            <li style={{ fontSize: '1.6rem', fontWeight: 900 }}>{currency.currencySymbol + totalAmount.toFixed(2)}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-lg-12">
                  <div className="item-empty-area text-center">
                    <div className="item-empty-area__icon mb-30">
                      <i className="pe-7s-cash"></i>
                    </div>
                    <div className="item-empty-area__text">
                      No items found in cart to checkout <br />{" "}
                      <Link to={process.env.PUBLIC_URL + "/shop-grid-standard"}>
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </Fragment>
  );
};

export default Checkout;
