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
      <div className="footer-logo">
        <Link to={process.env.PUBLIC_URL + "/"}>
          <img alt="" src={process.env.PUBLIC_URL + footerLogo} style={{ maxHeight: '200px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain', transform: 'translateY(-20px)' }} />
        </Link>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setShowLogin(true)} className="btn btn-sm" style={{ background: '#350008', color: '#fffef1', borderRadius: 20, padding: '8px 14px' }}>Admin</button>
      </div>
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://hasthemes.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          Flone
        </a>
        .<br /> All Rights Reserved
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
