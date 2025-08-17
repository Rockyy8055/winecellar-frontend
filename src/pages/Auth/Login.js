import React, { useState } from 'react';
import Layout from '../../layouts/Layout';
import { login } from '../../Services/auth-api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/checkout');
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ padding: '60px 16px' }}>
        <h2 style={{ fontWeight: 800, color: '#350008', textAlign: 'center', marginBottom: 24 }}>Login</h2>
        <form onSubmit={onSubmit} style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button className="btn btn-dark w-100" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/signup">Don’t have an account? Sign up</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Login;

