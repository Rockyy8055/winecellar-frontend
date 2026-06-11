import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layouts/Layout';

const brand = '#350008';
const cream = '#fffef1';

const pageStyle = {
  background: 'linear-gradient(180deg, #fffef1 0%, #f8f3e5 50%, #fffef1 100%)',
  color: brand,
  paddingTop: 56,
  paddingBottom: 84
};

const cardStyle = {
  background: 'rgba(255, 254, 241, 0.92)',
  border: '1px solid rgba(53, 0, 8, 0.12)',
  borderRadius: 16,
  boxShadow: '0 18px 45px rgba(53, 0, 8, 0.08)',
  padding: '28px 30px',
  marginBottom: 18
};

const sectionTitleStyle = {
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

const contactEmail = 'winecellarcustomerservice@gmail.com';

const PrivacyPolicy = () => {
  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <main style={pageStyle}>
        <div className="container" style={{ maxWidth: 980 }}>
          <div style={{ ...cardStyle, background: brand, color: cream }}>
            <p style={{ marginBottom: 8, color: 'rgba(255, 254, 241, 0.78)', fontWeight: 700 }}>Last updated: 11 June 2026</p>
            <h1 style={{ color: cream, fontWeight: 900, marginBottom: 12 }}>Privacy Policy</h1>
            <p style={{ ...textStyle, color: cream, fontSize: '1.08rem', marginBottom: 0 }}>
              This Privacy Policy explains how AXHET LIMITED, trading as WineCellar, collects, uses, stores, and shares personal information when you use our website, mobile app, and related order services.
            </p>
          </div>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Who We Are</h2>
            <p style={textStyle}>
              AXHET LIMITED is the controller for the personal information described in this policy. WineCellar is an alcohol retail and wholesale business operating from our London shop locations.
            </p>
            <ul style={listStyle}>
              <li><strong>Email:</strong> <a href={`mailto:${contactEmail}`} style={{ color: brand }}>{contactEmail}</a></li>
              <li><strong>Phone:</strong> 020 7241 1593</li>
              <li><strong>Location 1:</strong> 536 Kingsland Road, Dalston, London, E8 4AH, United Kingdom</li>
              <li><strong>Location 2:</strong> 164 Stoke Newington Road, London, N16 7UY, United Kingdom</li>
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Information We Collect</h2>
            <ul style={listStyle}>
              <li>Account details, such as your name, email address, phone number, login details, and saved preferences.</li>
              <li>Order and checkout details, including billing details, delivery or pickup address, order items, payment status, and order history.</li>
              <li>Age-restricted purchase information needed to check eligibility and comply with alcohol sales rules.</li>
              <li>Delivery and tracking details, such as shipping address, courier references, UPS tracking numbers, and fulfilment updates.</li>
              <li>Cart, wishlist, and product interaction data used to provide website and app features.</li>
              <li>Support messages, admin notes, refund/cancellation requests, and other communications with us.</li>
              <li>Technical data, including device, browser, IP address, session data, security logs, cookies, and similar local storage.</li>
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>How We Use Your Information</h2>
            <ul style={listStyle}>
              <li>To create and manage your account, cart, wishlist, orders, delivery, pickup, refunds, and customer support.</li>
              <li>To verify identity, account access, and age-restricted purchase eligibility where required.</li>
              <li>To process payments through secure payment providers. We do not intentionally store full card numbers on our website.</li>
              <li>To send order confirmations, service messages, delivery/tracking updates, and important account notices.</li>
              <li>To protect our business, customers, website, app, and payment systems from fraud, misuse, and security incidents.</li>
              <li>To meet legal, tax, accounting, licensing, product safety, and regulatory obligations.</li>
              <li>To improve our website, app, product range, service quality, and customer experience.</li>
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Legal Bases</h2>
            <p style={textStyle}>Where UK data protection law applies, we rely on the following legal bases:</p>
            <ul style={listStyle}>
              <li><strong>Contract:</strong> to provide accounts, checkout, order fulfilment, delivery, pickup, returns, and support.</li>
              <li><strong>Legal obligation:</strong> to comply with tax, accounting, age-restricted sales, fraud prevention, and regulatory requirements.</li>
              <li><strong>Legitimate interests:</strong> to secure our services, improve operations, manage customer relationships, and handle business records.</li>
              <li><strong>Consent:</strong> where we ask for optional marketing, non-essential cookies, or similar optional processing.</li>
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Who We Share Data With</h2>
            <p style={textStyle}>
              We only share personal information when needed to operate WineCellar, fulfil orders, comply with law, or protect our rights.
            </p>
            <ul style={listStyle}>
              <li>Payment processors and fraud prevention services.</li>
              <li>Delivery and courier partners, including UPS where a shipment or tracking service is used.</li>
              <li>Hosting, database, email, analytics, security, and customer support service providers.</li>
              <li>Professional advisers, insurers, regulators, law enforcement, courts, or public authorities where legally required.</li>
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Cookies And Local Storage</h2>
            <p style={textStyle}>
              We use essential cookies, authentication storage, cart storage, and similar technologies to keep you signed in, remember your cart, protect the website, and make checkout work. If we use optional analytics or marketing cookies, we will use them only where allowed by law and your choices.
            </p>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>International Transfers</h2>
            <p style={textStyle}>
              Some service providers may process data outside the United Kingdom. Where this happens, we use appropriate safeguards required by data protection law, such as approved contractual protections or other recognised transfer safeguards.
            </p>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>How Long We Keep Data</h2>
            <ul style={listStyle}>
              <li>Account data is kept while your account is active, unless you request deletion or we need to keep limited records for legal reasons.</li>
              <li>Order, tax, payment, refund, and accounting records may be kept for up to 6 years, or longer if required by law or a dispute.</li>
              <li>Customer support and security records are kept only as long as needed for service quality, safety, fraud prevention, and legal protection.</li>
              <li>Marketing preferences are kept until you unsubscribe or ask us to stop contacting you.</li>
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Your Rights</h2>
            <p style={textStyle}>
              Depending on your location and the data involved, you may have the right to access, correct, delete, restrict, object to, or receive a copy of your personal information. You may also withdraw consent where processing is based on consent.
            </p>
            <p style={textStyle}>
              To ask for account deletion, visit our <Link to="/account-deletion" style={{ color: brand, fontWeight: 800 }}>Account Deletion</Link> page or email us at <a href={`mailto:${contactEmail}`} style={{ color: brand, fontWeight: 800 }}>{contactEmail}</a>.
            </p>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              If you are in the UK and are unhappy with how we handle your personal information, you can contact the Information Commissioner's Office at <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" style={{ color: brand, fontWeight: 800 }}>ico.org.uk</a>.
            </p>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Policy Updates</h2>
            <p style={{ ...textStyle, marginBottom: 0 }}>
              We may update this Privacy Policy when our services, legal obligations, or data practices change. The latest version will always be available on this page.
            </p>
          </section>
        </div>
      </main>
    </Layout>
  );
};

export default PrivacyPolicy;
