import './ULogin.css';
import React, { useState } from 'react';
import { useNavigate,  useLocation} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ULogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const locationState = useLocation(); 


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}webusers/Login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password }),
            });
      
            const data = await response.json();
      
            if (response.ok) {
              toast.success('Login successful!');
              localStorage.setItem('token', data.token);
              const redirectTo = locationState.state?.from || '/';
              navigate(redirectTo);
            } else {
                toast.error(data.error || 'Login failed');
            }
          } catch (error) {
            toast.error('An error occurred. Please try again.');
          } finally {
            setLoading(false);
          }
    };

    return (
      <div className="login-wrapper">
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="login-options">
            <a href="/register">Register</a>
            <a href="/forgot-password">Forgot Password?</a>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
    );
};

export default ULogin;

