import PropTypes from "prop-types";
import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { API_BASE } from "../../Services/admin-api";

const FooterCopyright = ({ footerLogo, spaceBottomClass, colorClass }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = new URL('/api/admin/login', API_BASE).toString();
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(text || `Login failed: ${r.status}`);
      }
      const data = await r.json();
      const token = data.token || data.access_token;
      if (!token) throw new Error('No token returned');
      try { localStorage.setItem('admin_token', token); } catch (_) {}
      setShowLogin(false);
      navigate('/admin/orders');
    } catch (err) {
      setError(err?.message || 'Invalid credentials');
    }
  };

  return (
    <div className={clsx("copyright", spaceBottomClass, colorClass)}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div className="footer-logo">
          <Link to={"/"}>
            <img alt="WineCellar" src={process.env.PUBLIC_URL + footerLogo} style={{ maxHeight: '180px', maxWidth: '180px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, color: '#350008', fontWeight: 700 }} aria-label="Account and privacy links">
          <span style={{ width: '100%', fontSize: 13, fontWeight: 800, opacity: 0.72 }}>Account &amp; privacy</span>
          <a href="/privacy-policy" style={{ color: '#350008' }}>Privacy Policy</a>
          <span aria-hidden="true" style={{ opacity: 0.45 }}>|</span>
          <a href="/account-deletion" style={{ color: '#350008' }}>Request Account Deletion</a>
          <span aria-hidden="true" style={{ opacity: 0.45 }}>|</span>
          <Link to="/contact-us" style={{ color: '#350008' }}>Contact</Link>
          <button onClick={() => setShowLogin(true)} className="btn btn-sm" style={{ background: '#350008', color: '#fffef1', borderRadius: 20, padding: '8px 14px', minWidth: 80 }}>Admin</button>
        </div>
      </div>
      <p style={{ color: '#350008', marginTop: 16 }}>
        &copy; {new Date().getFullYear()} WineCellar by AXHET LIMITED.<br /> All Rights Reserved
      </p>
      {showLogin && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={()=>setShowLogin(false)}>
          <div style={{ background:'#fffef1', padding:20, width:'min(92vw, 420px)', borderRadius:12 }} onClick={(e)=>e.stopPropagation()}>
            <h4 style={{ marginTop:0, color:'#350008', fontWeight:800 }}>Admin Login</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">User ID (Email)</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="form-control" placeholder="winecellarcustomerservice@gmail.com" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="form-control" placeholder="Password" required />
              </div>
              {error && <div style={{ color:'#c62828', marginBottom:8 }}>{error}</div>}
              <div style={{ display:'flex', gap:8 }}>
                <button type="submit" className="btn" style={{ background:'#350008', color:'#fffef1' }}>Login</button>
                <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowLogin(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

FooterCopyright.propTypes = {
  footerLogo: PropTypes.string,
  spaceBottomClass: PropTypes.string,
  colorClass: PropTypes.string
};

export default FooterCopyright;


