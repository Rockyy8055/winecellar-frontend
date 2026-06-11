import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layouts/Layout';

const brand = '#350008';
const cream = '#fffef1';
const supportEmail = 'winecellarcustomerservice@gmail.com';

const pageStyle = {
  background: 'linear-gradient(180deg, #fffef1 0%, #f8f3e5 50%, #fffef1 100%)',
  color: brand,
  paddingTop: 56,
  paddingBottom: 84
};

const panelStyle = {
  background: 'rgba(255, 254, 241, 0.92)',
  border: '1px solid rgba(53, 0, 8, 0.12)',
  borderRadius: 16,
  boxShadow: '0 18px 45px rgba(53, 0, 8, 0.08)',
  padding: '28px 30px',
  marginBottom: 18
};

const titleStyle = {
  color: brand,
  fontWeight: 800,
  fontSize: '1.35rem',
  marginBottom: 12
};

const textStyle = {
  color: brand,
  fontSize: '1rem',
  lineHeight: 1.75,
  marginBottom: 12
};

const listStyle = {
  color: brand,
  lineHeight: 1.75,
  paddingLeft: 22,
  marginBottom: 0
};

const AccountDeletion = () => {
  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <main style={pageStyle}>
        <div className="container" style={{ maxWidth: 940 }}>
          <div style={{ ...panelStyle, background: brand, color: cream }}>
            <p style={{ marginBottom: 8, color: 'rgba(255, 254, 241, 0.78)', fontWeight: 700 }}>WineCellar account support</p>
            <h1 style={{ color: cream, fontWeight: 900, marginBottom: 12 }}>Account Deletion</h1>
            <p style={{ ...textStyle, color: cream, fontSize: '1.08rem', marginBottom: 0 }}>
              You can request deletion of your WineCellar website or mobile app account at any time. This page explains how to submit the request and what data may need to be retained for legal or order-related reasons.
            </p>
          </div>

          <section style={panelStyle}>
            <h2 style={titleStyle}>How To Request Deletion</h2>
            <p style={textStyle}>
              Email us from the email address linked to your WineCellar account, or include enough information for us to verify that the account belongs to you.
            </p>
            <div style={{ background: '#ffffff', border: '1px solid rgba(53, 0, 8, 0.12)', borderRadius: 12, padding: 18, marginBottom: 14 }}>
              <p style={{ ...textStyle, marginBottom: 6 }}><strong>Send to:</strong> <a href={`mailto:${supportEmail}`} style={{ color: brand, fontWeight: 800 }}>{supportEmail}</a></p>
              <p style={{ ...textStyle, marginBottom: 6 }}><strong>Subject:</strong> Account deletion request</p>
              <p style={{ ...textStyle, marginBottom: 0 }}><strong>Include:</strong> your full name, account email, phone number, and any recent order number if available.</p>
            </div>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              You may also contact us through the <Link to="/contact-us" style={{ color: brand, fontWeight: 800 }}>Contact Us</Link> page.
            </p>
          </section>

          <section style={panelStyle}>
            <h2 style={titleStyle}>What Will Be Deleted</h2>
            <ul style={listStyle}>
              <li>Your customer account profile where deletion is possible.</li>
              <li>Saved wishlist, cart, and preference data linked to the account.</li>
              <li>Optional marketing preferences and non-essential profile details.</li>
              <li>Account login access, after we complete verification and deletion.</li>
            </ul>
          </section>

          <section style={panelStyle}>
            <h2 style={titleStyle}>What May Be Retained</h2>
            <p style={textStyle}>
              Some information cannot be deleted immediately if we need it for legal, tax, accounting, licensing, payment, fraud prevention, customer safety, fulfilment, refund, chargeback, or dispute reasons.
            </p>
            <ul style={listStyle}>
              <li>Completed order, payment, invoice, refund, and tax records may be retained for up to 6 years, or longer if legally required.</li>
              <li>Open orders, delivery, pickup, UPS tracking, cancellation, or refund records may be retained until the process is complete.</li>
              <li>Security and fraud-prevention records may be retained where necessary to protect customers, WineCellar, and payment systems.</li>
              <li>Records required by alcohol sales, age-restricted purchase, or regulatory obligations may be retained as required by law.</li>
            </ul>
          </section>

          <section style={panelStyle}>
            <h2 style={titleStyle}>Response Time</h2>
            <p style={textStyle}>
              We aim to respond as soon as possible. Where UK data protection law applies, we normally respond to deletion requests within one month after verifying your identity. If a request is complex, we may need extra time and will let you know.
            </p>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              After deletion, you may need to create a new account if you want to place future orders online.
            </p>
          </section>

          <section style={panelStyle}>
            <h2 style={titleStyle}>Privacy Policy</h2>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              For more details about how WineCellar collects, uses, shares, and stores personal information, please read our <Link to="/privacy-policy" style={{ color: brand, fontWeight: 800 }}>Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </main>
    </Layout>
  );
};

export default AccountDeletion;
