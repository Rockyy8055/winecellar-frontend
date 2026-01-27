import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../layouts/Layout';
import { login, signup, me } from '../../Services/auth-api';
import { useLocation, useNavigate } from 'react-router-dom';

const initialFormState = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const AuthPage = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const redirectTimer = useRef(null);

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('redirectTo') || '/';
  }, [location.search]);

  useEffect(() => {
    setMode(initialMode);
    setForm(initialFormState);
    setError('');
    setStatus('');
  }, [initialMode]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const profile = await me();
        if (!ignore && profile) {
          navigate(redirectTo, { replace: true });
          return;
        }
      } catch (_) {
        // ignore network errors, user is unauthenticated
      } finally {
        if (!ignore) setCheckingAuth(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [navigate, redirectTo]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setForm(initialFormState);
    setError('');
    setStatus('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedPassword = form.password.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup' && trimmedPassword !== form.confirmPassword.trim()) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: trimmedEmail, password: trimmedPassword });
        setStatus('Welcome back! Redirecting…');
      } else {
        await signup({
          name: form.fullName.trim() || trimmedEmail,
          phone: form.phone.trim(),
          email: trimmedEmail,
          password: trimmedPassword,
          confirmPassword: form.confirmPassword.trim() || trimmedPassword
        });
        setStatus('Account created successfully. Redirecting…');
      }

      try {
        await me();
      } catch (_) {
        // ignore hydrate failures; backend might not expose a profile endpoint yet
      }

      redirectTimer.current = setTimeout(() => {
        navigate(redirectTo || '/', { replace: true });
      }, 800);
    } catch (err) {
      const fallbackMessage = mode === 'login'
        ? 'Login failed. Please check your details and try again.'
        : 'Sign up failed. Please review your details and try again.';
      setError(err?.message || fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';
  const submitLabel = loading
    ? (isSignup ? 'Creating account…' : 'Logging in…')
    : (isSignup ? 'Create account' : 'Login');

  if (checkingAuth) {
    return (
      <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#350008', fontWeight: 700, fontSize: '1.1rem' }}>Loading…</div>
        </div>
      </Layout>
    );
  }

  // Debug render
  console.log('AuthPage render mode:', mode, 'form:', form);

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div
        style={{
          minHeight: 'calc(100vh - 140px)',
          background: 'linear-gradient(145deg, #fff3e4 0%, #fde1d2 40%, #f4c2b3 100%)',
          padding: '80px 16px'
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            alignItems: 'stretch',
            justifyContent: 'center'
          }}
        >
          <section
            style={{
              flex: '1 1 320px',
              minWidth: 280,
              color: '#350008',
              background: 'rgba(255, 255, 255, 0.65)',
              borderRadius: 24,
              padding: '40px 36px',
              boxShadow: '0 32px 80px rgba(53,0,8,0.14)',
              backdropFilter: 'blur(6px)'
            }}
          >
            <p style={{ fontSize: '0.85rem', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12, opacity: 0.8 }}>Stay in the Cellar loop</p>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
              Access exclusive releases & express checkout.
            </h1>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.85 }}>
              Create an account or log in with your email address to manage orders, save favourites, and enjoy a smoother Pick &amp; Pay experience.
            </p>
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: 24, fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
                <span aria-hidden style={{ fontSize: '1.2rem' }}>🍷</span>
                <span>Secure account with email + password only — no lengthy forms.</span>
              </li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
                <span aria-hidden style={{ fontSize: '1.2rem' }}>⚡</span>
                <span>Checkout faster with saved profile and order history.</span>
              </li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span aria-hidden style={{ fontSize: '1.2rem' }}>🎁</span>
                <span>Be the first to know about cellar exclusives and tasting events.</span>
              </li>
            </ul>
          </section>

          <section
            style={{
              flex: '1 1 360px',
              minWidth: 320,
              background: '#fffaf5',
              borderRadius: 24,
              padding: '36px 34px 40px',
              boxShadow: '0 40px 90px rgba(53,0,8,0.24)'
            }}
          >
            <div
              style={{
                display: 'flex',
                background: '#f6d9c6',
                borderRadius: 999,
                padding: 4,
                gap: 4,
                marginBottom: 26
              }}
            >
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 999,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  background: !isSignup ? '#350008' : 'transparent',
                  color: !isSignup ? '#fffef6' : '#350008',
                  transition: 'all 0.2s ease'
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 999,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  background: isSignup ? '#350008' : 'transparent',
                  color: isSignup ? '#fffef6' : '#350008',
                  transition: 'all 0.2s ease'
                }}
              >
                Create account
              </button>
            </div>

            <h2 style={{ marginBottom: 8, color: '#350008', fontWeight: 800, fontSize: '1.8rem' }}>
              {isSignup ? 'Join the cellar' : 'Welcome back'}
            </h2>
            <p style={{ marginBottom: 24, color: '#6b4d53', fontSize: '0.95rem' }}>
              {isSignup
                ? 'Sign up with your email to start collecting from our finest stores.'
                : 'Log in with your email address to continue where you left off.'}
            </p>

            <form onSubmit={handleSubmit}>
              {isSignup && (
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 600, color: '#350008' }}>Full name</label>
                  <input
                    className="form-control"
                    value={form.fullName}
                    onChange={updateField('fullName')}
                    placeholder="Amelia Hart"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: '#350008' }}>Email address</label>
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="you@example.com"
                  autoComplete={isSignup ? 'email' : 'username' }
                  required
                />
              </div>

              {isSignup && (
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 600, color: '#350008' }}>Phone (optional)</label>
                  <input
                    className="form-control"
                    type="tel"
                    value={form.phone}
                    onChange={updateField('phone')}
                    placeholder="+44 20 1234 5678"
                    autoComplete="tel"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: '#350008' }}>Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={form.password}
                  onChange={updateField('password')}
                  placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                />
              </div>

              {isSignup && (
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 600, color: '#350008' }}>Confirm password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={form.confirmPassword}
                    onChange={updateField('confirmPassword')}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert" style={{ marginBottom: 18 }}>
                  {error}
                </div>
              )}

              {status && (
                <div className="alert alert-success" role="status" style={{ marginBottom: 18 }}>
                  {status}
                </div>
              )}

              <button
                type="submit"
                className="btn"
                style={{
                  width: '100%',
                  background: '#350008',
                  color: '#fffef6',
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: '12px 16px',
                  boxShadow: '0 18px 40px rgba(53,0,8,0.28)',
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                  border: 'none'
                }}
                disabled={loading}
              >
                {submitLabel}
              </button>

              <div style={{ textAlign: 'center', marginTop: 18, color: '#6b4d53', fontSize: '0.9rem' }}>
                {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isSignup ? 'login' : 'signup')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#350008',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isSignup ? 'Login here' : 'Create one'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
