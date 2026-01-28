import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../layouts/Layout";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createOrder } from '../../Services/orders-api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const STORE_LOCATIONS = [
  {
    id: 1,
    name: 'Shop Location 1',
    addressLine1: '536 Kingsland Road',
    city: 'Dalston, London',
    postcode: 'E8 4AH',
    country: 'United Kingdom',
    phone: '020 7241 1593'
  },
  {
    id: 2,
    name: 'Shop Location 2',
    addressLine1: '164 Stoke Newington Road',
    city: 'London',
    postcode: 'N16 7UY',
    country: 'United Kingdom',
    phone: '020 7241 1593'
  }
];

const StripePaymentForm = ({ onSuccess, canPay, isSubmitting }) => {
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
        if (onSuccess) await onSuccess(id);
      } catch (submissionError) {
        setError(submissionError?.message || 'Unable to finalize order.');
      }
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
        disabled={processing || !stripe || !elements || !canPay || isSubmitting}
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
        {processing ? 'Processing...' : (isSubmitting ? 'Finalizing order...' : 'Pay Now')}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency);
  const [subtotal, setSubtotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('card'); // default to card
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paypalPaid, setPaypalPaid] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shipping, setShipping] = useState(0);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [confirmedStore, setConfirmedStore] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [confirmationLocation, setConfirmationLocation] = useState('');
  const selectedStore = useMemo(
    () => STORE_LOCATIONS.find((location) => location.id === selectedStoreId) || null,
    [selectedStoreId]
  );
  const orderSubmitLock = useRef(false);
  const isTradeCustomer = (() => {
    try { return !!localStorage.getItem('trade_customer_profile'); } catch (_) { return false; }
  })();
  // Billing form state
  const [billing, setBilling] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', postcode: '' });
  const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i;
  const isUKPostcode = (pc) => ukPostcodeRegex.test(String(pc || '').trim());
  const isBillingComplete = Object.values(billing).every(v => String(v || '').trim().length > 0) && isUKPostcode(billing.postcode);
  const elementsOptions = useMemo(() => (
    clientSecret ? { clientSecret, appearance: { theme: 'stripe' } } : undefined
  ), [clientSecret]);

  useEffect(() => {
    let sub = 0;
    cartItems.forEach(item => { sub += item.price * item.quantity; });
    // For Pick & Pay (cod), shipping is always £0
    const shippingFee = paymentMethod === 'cod' ? 0 : (sub >= 100 ? 0 : 4.99);
    const discount = isTradeCustomer ? sub * 0.20 : 0; // 20% off for trade customers
    const vat = isTradeCustomer ? sub * 0.20 : 0;      // 20% VAT for trade customers
    const total = sub - discount + vat + shippingFee;
    setSubtotal(sub);
    setShipping(shippingFee);
    setDiscountAmount(discount);
    setVatAmount(vat);
    setTotalAmount(total);
  }, [cartItems, isTradeCustomer, paymentMethod]);

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

  useEffect(() => {
    if (showStoreSelector && selectedStoreId == null && STORE_LOCATIONS.length) {
      setSelectedStoreId(STORE_LOCATIONS[0].id);
    }
  }, [showStoreSelector, selectedStoreId]);

  const handlePlaceOrderCOD = () => {
    if (!isBillingComplete) {
      alert('Please fill the Billing Details.');
      return;
    }
    setOrderError('');
    setShowStoreSelector(true);
  };

  const handleConfirmStorePickup = async () => {
    if (!selectedStore) {
      alert('Please select a store for pickup.');
      return;
    }
    try {
      const meRes = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, { credentials: 'include' });
      if (!meRes.ok) {
        alert('Please log in to place an order.');
        return;
      }
    } catch (err) {
      console.error(err);
      alert('Unable to verify login. Please try again.');
      return;
    }
    try {
      await finalizeOrder('pick_pay', { store: selectedStore });
    } catch (err) {
      console.error(err);
    }
  };

  const orderItemsPayload = useMemo(() => (
    cartItems.map(item => ({
      id: item.ProductId || item.id,
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      size: item.selectedProductSize || null,
      lineTotal: Number((item.price * item.quantity).toFixed(2))
    }))
  ), [cartItems]);

  const finalizeOrder = useCallback(async (method, meta = {}) => {
    if (!isBillingComplete) {
      const message = 'Please complete billing details before finalizing your order.';
      setOrderError(message);
      throw new Error(message);
    }
    if (!orderItemsPayload.length) {
      const message = 'Your cart is empty. Add items before checking out.';
      setOrderError(message);
      throw new Error(message);
    }
    if (orderSubmitLock.current) {
      return;
    }
    orderSubmitLock.current = true;
    setSubmittingOrder(true);
    setOrderError('');

    const storeRef = method === 'pick_pay' ? (meta.store || selectedStore) : null;
    const normalizedMethod = method === 'pick_pay' ? 'PICK_PAY' : method.toUpperCase();
    const normalizedTotals = {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(vatAmount.toFixed(2)),
      discount: Number(discountAmount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(totalAmount.toFixed(2))
    };

    const payload = {
      customerEmail: billing.email.trim(),
      customerName: `${billing.firstName} ${billing.lastName}`.trim(),
      paymentMethod: normalizedMethod,
      orderItems: orderItemsPayload.map(({ id, name, quantity, price, size }) => ({
        id,
        name,
        quantity,
        price,
        size
      })),
      subtotal: normalizedTotals.subtotal,
      tax: normalizedTotals.tax,
      total: normalizedTotals.total,
      shopLocation: storeRef ? `${storeRef.name} (${storeRef.city})` : 'Online Checkout',
      billingDetails: {
        firstName: billing.firstName,
        lastName: billing.lastName,
        email: billing.email,
        phone: billing.phone,
        address: billing.address,
        postcode: billing.postcode
      },
      paymentReference: meta.transactionId || null,
      pickupDetails: storeRef
        ? {
            name: storeRef.name,
            line1: storeRef.addressLine1,
            city: storeRef.city,
            postcode: storeRef.postcode,
            country: storeRef.country,
            phone: storeRef.phone
          }
        : null,
      // Legacy fields kept for backward compatibility with current Render API
      method: normalizedMethod === 'PICK_PAY' ? 'cod' : normalizedMethod.toLowerCase(),
      customer: {
        name: `${billing.firstName} ${billing.lastName}`.trim(),
        email: billing.email,
        phone: billing.phone
      },
      items: orderItemsPayload.map(({ id, name, quantity, price, size, lineTotal }) => ({
        id,
        name,
        qty: quantity,
        price,
        size,
        total: lineTotal
      })),
      discount: normalizedTotals.discount,
      vat: normalizedTotals.tax,
      shipping: normalizedTotals.shipping,
      shippingAddress: storeRef
        ? {
            storeName: storeRef.name,
            line1: storeRef.addressLine1,
            city: storeRef.city,
            postcode: storeRef.postcode,
            country: storeRef.country,
            phone: storeRef.phone
          }
        : {
            line1: billing.address,
            city: 'London',
            postcode: billing.postcode,
            country: 'United Kingdom',
            phone: billing.phone
          }
    };

    try {
      const response = await createOrder(payload);
      const newId = response?.orderId || response?.trackingCode || response?.id || `ORD-${Date.now()}`;
      setOrderId(newId);
      setOrderPlaced(true);
      setConfirmedStore(storeRef || null);
      setConfirmationEmail(payload.customerEmail);
      setConfirmationLocation(payload.shopLocation);
      setShowStoreSelector(false);
      setSelectedStoreId(null);
      setPaypalPaid(method === 'paypal');
      try {
        localStorage.setItem('last_order_id', newId);
        localStorage.setItem('last_tracking_code', newId);
      } catch (_) {}
    } catch (err) {
      orderSubmitLock.current = false;
      const message = err?.message || 'Unable to finalize your order. Please try again.';
      setOrderError(message);
      throw err;
    } finally {
      setSubmittingOrder(false);
    }
  }, [billing, isBillingComplete, orderItemsPayload, subtotal, vatAmount, totalAmount, selectedStore, discountAmount, shipping]);

  const handleStripeSuccess = useCallback(async (paymentIntentId) => {
    await finalizeOrder('card', { transactionId: paymentIntentId });
  }, [finalizeOrder]);

  const handlePayPalSuccess = useCallback(async (orderID) => {
    await finalizeOrder('paypal', { transactionId: orderID });
  }, [finalizeOrder]);

  const handleCloseSuccess = () => {
    setOrderPlaced(false);
    setConfirmedStore(null);
    setOrderId(null);
    setConfirmationEmail('');
    setConfirmationLocation('');
    setPaypalPaid(false);
    setShowStoreSelector(false);
    orderSubmitLock.current = false;
  };

  // PayPal client ID should be set in .env and passed here
  const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || "test";

  return (
    <>
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
                            <button type="button" onClick={handlePlaceOrderCOD} style={{ background: '#111', color: '#fff', padding: '16px 28px', border: 'none', borderRadius: 8, fontSize: 18, cursor: 'pointer', width: '100%' }}>
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
                            <StripePaymentForm
                              canPay={isBillingComplete}
                              isSubmitting={submittingOrder}
                              onSuccess={handleStripeSuccess}
                            />
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
                                  return actions.order.capture().then(async () => {
                                    setPaypalPaid(true);
                                    const id = data?.orderID || `PP-${Date.now()}`;
                                    try {
                                      await handlePayPalSuccess(id);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  });
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
                        {orderError && (
                          <div style={{ color: '#b12704', fontWeight: 600, marginTop: 16 }}>
                            {orderError}
                          </div>
                        )}
                        {submittingOrder && (
                          <div style={{ color: '#350008', fontWeight: 600, marginTop: 8 }}>
                            Finalizing your order...
                          </div>
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
                        <div className="your-order-total" style={{ fontSize: '1.1rem' }}>
                          <ul>
                            <li>Subtotal</li>
                            <li>{currency.currencySymbol + subtotal.toFixed(2)}</li>
                          </ul>
                          {isTradeCustomer && (
                            <ul>
                              <li>Trade Discount (20%)</li>
                              <li>-{currency.currencySymbol + discountAmount.toFixed(2)}</li>
                            </ul>
                          )}
                          {isTradeCustomer && (
                            <ul>
                              <li>VAT (20%)</li>
                              <li>{currency.currencySymbol + vatAmount.toFixed(2)}</li>
                            </ul>
                          )}
                          <ul>
                            <li>Shipping</li>
                            <li>{shipping === 0 ? 'FREE' : (currency.currencySymbol + shipping.toFixed(2))}</li>
                          </ul>
                          <ul>
                            <li className="order-total" style={{ fontSize: '1.4rem', fontWeight: 900 }}>Total</li>
                            <li style={{ fontSize: '1.4rem', fontWeight: 900 }}>{currency.currencySymbol + totalAmount.toFixed(2)}</li>
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
                      No items found in cart to checkout.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* Store Selector Modal */}
      {showStoreSelector && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 }}
          onClick={() => { setShowStoreSelector(false); setSelectedStoreId(null); }}
        >
          <div
            style={{
              position:'relative',
              background:'#fffdf6',
              maxWidth:620,
              width:'min(620px, 92vw)',
              borderRadius:18,
              boxShadow:'0 22px 45px rgba(0,0,0,0.22)',
              padding:'24px 28px 26px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => { setShowStoreSelector(false); setSelectedStoreId(null); }}
              style={{
                position:'absolute',
                top:16,
                right:16,
                background:'transparent',
                border:'none',
                fontSize:22,
                color:'#6f6f6f',
                cursor:'pointer',
                lineHeight:1
              }}
              aria-label="Close store selector"
            >
              ×
            </button>
            <h3 style={{ margin:'0 0 12px', textAlign:'center', color:'#2c040a', fontSize:'1.6rem', fontWeight:800 }}>Pick your collection store</h3>
            <p style={{ margin:'0 0 18px', textAlign:'center', color:'#6b5a5c', fontSize:'0.95rem' }}>
              Choose the location where you’d like to collect your order.
            </p>
            <div
              style={{
                display:'grid',
                gap:16,
                gridTemplateColumns:'repeat(auto-fit, minmax(255px, 1fr))'
              }}
            >
              {STORE_LOCATIONS.map((location) => {
                const isActive = selectedStoreId === location.id;
                return (
                  <label
                    key={location.id}
                    style={{
                      position:'relative',
                      display:'flex',
                      alignItems:'flex-start',
                      gap:14,
                      padding:'18px 20px',
                      borderRadius:14,
                      border:isActive ? '2px solid #2c040a' : '1px solid #e1d8d0',
                      background:isActive ? 'linear-gradient(130deg, #fff6ea 0%, #ffe8d8 100%)' : '#ffffff',
                      boxShadow:isActive ? '0 12px 24px rgba(44,4,10,0.18)' : '0 6px 18px rgba(0,0,0,0.08)',
                      transition:'all 0.24s ease',
                      cursor:'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="pickupStore"
                      checked={isActive}
                      onChange={() => setSelectedStoreId(location.id)}
                      style={{ marginTop:4, accentColor:'#2c040a' }}
                    />
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <strong style={{ fontSize:'1.05rem', color:'#2c040a' }}>{location.name}</strong>
                        {isActive && (
                          <span style={{ fontSize:'0.7rem', fontWeight:700, color:'#2c040a', background:'#fde5cf', padding:'3px 8px', borderRadius:999 }}>Selected</span>
                        )}
                      </div>
                      <div style={{ color:'#5c4a4d', fontSize:'0.92rem', lineHeight:1.45 }}>
                        {location.addressLine1}<br/>
                        {location.city}<br/>
                        {location.postcode}, {location.country}<br/>
                        <span style={{ fontWeight:600 }}>Phone:</span> {location.phone}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div style={{ marginTop:22, display:'flex', justifyContent:'center' }}>
              <button
                type="button"
                onClick={handleConfirmStorePickup}
                style={{
                  padding:'12px 28px',
                  minWidth:240,
                  border:'none',
                  borderRadius:999,
                  background:'#2c040a',
                  color:'#fffef6',
                  fontSize:'1rem',
                  fontWeight:700,
                  letterSpacing:0.35,
                  cursor:'pointer',
                  boxShadow:'0 16px 24px rgba(44,4,10,0.25)'
                }}
                disabled={submittingOrder}
              >
                {submittingOrder ? 'Finalizing...' : 'Collect from this store'}
              </button>
            </div>
            {orderError && (
              <div style={{ marginTop:14, textAlign:'center', color:'#b12704', fontWeight:600 }}>
                {orderError}
              </div>
            )}
          </div>
        </div>
      )}

      {orderPlaced && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, padding:16 }}>
          <div style={{ background:'#fffef1', borderRadius:16, padding:'32px 28px', maxWidth:520, width:'min(520px, 92vw)', textAlign:'center', boxShadow:'0 20px 55px rgba(0,0,0,0.28)' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
            <h3 style={{ margin:'0 0 12px', color:'#350008', fontWeight:800 }}>Order confirmed!</h3>
            <p style={{ margin:'0 0 8px', color:'#513236', fontSize:'1rem' }}>
              Order <strong>{orderId}</strong> is locked in. A confirmation email has been sent to <strong>{confirmationEmail || billing.email}</strong>.
            </p>
            <p style={{ margin:'0 0 14px', color:'#513236', fontSize:'0.95rem' }}>
              {confirmedStore
                ? `${confirmedStore.name}, ${confirmedStore.addressLine1}, ${confirmedStore.city} ${confirmedStore.postcode}`
                : (confirmationLocation || 'Our fulfillment team is preparing your bottles now.')}
            </p>
            {confirmedStore && (
              <div style={{ marginBottom:14, color:'#350008', fontWeight:600, fontSize:'0.95rem' }}>
                Phone: {confirmedStore.phone}
              </div>
            )}
            <button
              type="button"
              onClick={handleCloseSuccess}
              style={{ background:'#350008', color:'#fffef1', border:'none', borderRadius:999, padding:'12px 28px', fontWeight:700, cursor:'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;


