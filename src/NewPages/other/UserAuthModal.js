import React, { useState } from 'react';
import { signup, login } from '../../Services/auth-api';

const UserAuthModal = ({ show, onClose, onSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await signup({ name: form.name, phone: form.phone, email: form.email, password: form.password, confirmPassword: form.confirmPassword || form.password });
      } else {
        await login({ email: form.email, password: form.password });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={onClose}>
      <div style={{ background:'#fffef1', padding:20, width:'min(92vw, 480px)', borderRadius:12 }} onClick={(e)=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h4 style={{ margin:0, color:'#350008', fontWeight:800 }}>{mode === 'register' ? 'Create Account' : 'User Login'}</h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Close</button>
        </div>
        <div style={{ marginTop:10 }}>
          <button className={`btn btn-sm ${mode==='login'?'btn-dark':''}`} onClick={()=>setMode('login')} style={{ marginRight:8 }}>Login</button>
          <button className={`btn btn-sm ${mode==='register'?'btn-dark':''}`} onClick={()=>setMode('register')}>Register</button>
        </div>
        <form onSubmit={submit} style={{ marginTop:12 }}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} required />
          </div>
          {mode === 'register' && (
            <>
              <div className="mb-3"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label">Confirm Password</label><input className="form-control" type="password" value={form.confirmPassword} onChange={(e)=>setForm({ ...form, confirmPassword: e.target.value })} required /></div>
            </>
          )}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={(e)=>setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <div style={{ color:'#c62828', marginBottom:8 }}>{error}</div>}
          <button className="btn" style={{ background:'#350008', color:'#fffef1' }} disabled={loading}>{loading ? 'Please wait...' : (mode==='register'?'Create Account':'Login')}</button>
        </form>
      </div>
    </div>
  );
};

export default UserAuthModal;



