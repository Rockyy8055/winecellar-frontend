import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [resendOtpAvailable, setResendOtpAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (showOtpField) {
        interval = setInterval(() => {
            setTimer((prevTimer) => {
              if (prevTimer <= 1) {
                clearInterval(interval);
                setResendOtpAvailable(true);
                return 0;
              }
              return prevTimer - 1;
            });
          }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpField, timer]);

  const checkExists = async (field, value) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}webusers/Check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();
      if (field === 'email') {
        setEmailExists(data.exists);
      } else if (field === 'username') {
        setUsernameExists(data.exists);
      }
    } catch (error) {
        toast.error('An error occurred while checking the field');
    }
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    if (emailValue) {
      checkExists('email', emailValue);
    } else {
      setEmailExists(false);
    }
  };

  const handleUsernameChange = (e) => {
    const usernameValue = e.target.value;
    setUsername(usernameValue);
    if (usernameValue) {
      checkExists('username', usernameValue);
    } else {
      setUsernameExists(false);
    }
  };

  const handleEmailBlur = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    checkPasswordStrength(passwordValue);
  };

  const handlePasswordPaste = (e) => {
    e.preventDefault();
    toast.error('Pasting text is not allowed in the password field');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSendOtp = async () => {
    if (emailError || passwordError || emailExists || usernameExists) {
      toast.error('Please fix the errors before sending OTP');
      return;
    }
    setLoading(true);
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}webusers/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, username }),
        });
  
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || 'OTP sent successfully!');
          setShowOtpField(true);
          setFieldsDisabled(true);
          setTimer(30); 
        setResendOtpAvailable(false);
        } else {
          toast.error(data.message || 'Failed to send OTP');
        }
      } catch (error) {
        toast.error('An error occurred while sending OTP');
      }
      finally {
        setLoading(false);
      }
  };

  const handleOtpChange = async (e) => {
    const value = e.target.value;
    setOtp(value);
    if (value.length === 6) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}webusers/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp: value, username, password }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || 'OTP verified and user created successfully');
          localStorage.setItem('token', data.token);
        } else {
          toast.error(data.message || 'Failed to verify OTP');
        }
      } catch (error) {
        toast.error('An error occurred while verifying OTP');
        console.error('Error verifying OTP:', error);
      }
    }
  };


  const checkPasswordStrength = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setPasswordError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
    } else {
      setPasswordError('');
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Registration successful!');
  };

  const handleResendOtp = () => {
    setResendOtpAvailable(false);
    setTimer(30); 
    handleSendOtp();
  };

  const handleChangeRegistrationFields = () => {
    setFieldsDisabled(false);
    setShowOtpField(false);
    setResendOtpAvailable(false);
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Register</h2>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              name="email"
              required
              disabled={fieldsDisabled}
            />
             {emailError && <p className="error-message">{emailError}</p>}
             {emailExists && <p className="error-message">Email already exists</p>}
          </label>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              name="Username"
              required
              disabled={fieldsDisabled}
            />
            {usernameExists && <p className="error-message">Username already exists</p>}
          </label>
          <label className="password-label">
            Password:
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onPaste={handlePasswordPaste}
                name="new-password"
                autoComplete="new-password"
                required
                disabled={fieldsDisabled}
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={toggleShowPassword}
                className="password-toggle-icon"
              />
            </div>
            {passwordError && <p className="error-message">{passwordError}</p>}
          </label>
          <button type="button" onClick={handleSendOtp} className="send-otp-button" disabled={fieldsDisabled || loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          {showOtpField && (
            <>
              <label>
                OTP:
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength="6"
                  required
                />
              </label>
              <div className="otp-options">
              <div className="timer">
                  {resendOtpAvailable ? '' : `Resend OTP in ${timer}s`}
                </div>
                <button type="button" onClick={handleResendOtp} disabled={!resendOtpAvailable}>
                  Resend OTP
                </button>
                <button type="button" onClick={handleChangeRegistrationFields}>
                  Change Registration Fields
                </button>
              </div>
            </>
          )}
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;

