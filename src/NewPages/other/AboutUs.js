import React from 'react';
import Layout from '../../layouts/Layout';

const AboutUs = () => {
  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <h1 style={{ color: '#350008', fontWeight: 800, marginBottom: '10px' }}>AXHET LIMITED</h1>
        <h3 style={{ color: '#350008', fontWeight: 700, marginBottom: '24px' }}>About Company</h3>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#350008' }}>
          Founded in 2012 by <strong>Mr. Desai</strong>, AXHET Limited is a family-run business with more than 20 years of
          experience in the beverages industry. We operate across both <strong>retail</strong> and <strong>wholesale</strong> domains, delivering
          quality products and reliable service to our customers.
        </p>
        <ul style={{ marginTop: '16px', color: '#350008', fontSize: '1.05rem' }}>
          <li><strong>Company Launch:</strong> 2012</li>
          <li><strong>Founder:</strong> Mr. Desai</li>
          <li><strong>Experience:</strong> 20+ years</li>
          <li><strong>Operations:</strong> Retail and Wholesale</li>
          <li><strong>Nature:</strong> Family-run business</li>
        </ul>
      </div>
    </Layout>
  );
};

export default AboutUs;

