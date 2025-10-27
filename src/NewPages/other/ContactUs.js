import React from 'react';
import Layout from '../../layouts/Layout';

const ContactUs = () => {
  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <h1 style={{ color: '#350008', fontWeight: 800, marginBottom: '12px' }}>Contact Us</h1>
        <div style={{ fontSize: '1.1rem', color: '#350008', lineHeight: 1.8 }}>
          <p><strong>Email:</strong> winecellarcustomerservice@gmail.com</p>
          <p><strong>Phone:</strong> 020 7241 1593</p>

          <h3 style={{ marginTop: '24px', fontWeight: 700 }}>Shop Locations</h3>
          <div className="row" style={{ marginTop: 10 }}>
            <div className="col-md-6 mb-3">
              <div style={{ background: '#fffef1', border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Shop Location 1</div>
                <div>536 Kingsland Road, Dalston, London, E8 4AH, United Kingdom</div>
                <div><strong>Phone:</strong> 020 7241 1593</div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div style={{ background: '#fffef1', border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Shop Location 2</div>
                <div>164 Stoke Newington Road, London, N16 7UY</div>
                <div><strong>Phone:</strong> 020 7241 1593</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;



