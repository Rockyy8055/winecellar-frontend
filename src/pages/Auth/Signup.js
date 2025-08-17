import React, { useState } from 'react';
import Layout from '../../layouts/Layout';
import { signup } from '../../Services/auth-api';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await signup({ name, phone, email, password, confirmPassword });
      navigate('/checkout');
    } catch (err) {
      setError(err?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ padding: '60px 16px' }}>
        <h2 style={{ fontWeight: 800, color: '#350008', textAlign: 'center', marginBottom: 24 }}>Create Account</h2>
        <form onSubmit={onSubmit} style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="mb-3"><label className="form-label">Name</label><input className="form-control" value={name} onChange={(e)=>setName(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">Phone Number</label><input className="form-control" value={phone} onChange={(e)=>setPhone(e.target.value)} /></div>
          <div className="mb-3"><label className="form-label">Email</label><input className="form-control" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">New Password</label><input className="form-control" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">Confirm New Password</label><input className="form-control" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required /></div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button className="btn btn-dark w-100" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Signup;

