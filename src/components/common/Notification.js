import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Notification = () => {
  const { notification, clearNotification } = useAuth();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  const getNotificationStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      zIndex: 9999,
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      animation: 'slideIn 0.3s ease-out'
    };

    switch (notification.type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#10b981',
          color: 'white',
          borderLeft: '4px solid #059669'
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#ef4444',
          color: 'white',
          borderLeft: '4px solid #dc2626'
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#f59e0b',
          color: 'white',
          borderLeft: '4px solid #d97706'
        };
      case 'info':
      default:
        return {
          ...baseStyles,
          backgroundColor: '#3b82f6',
          color: 'white',
          borderLeft: '4px solid #2563eb'
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={styles}>
        <span>{notification.message}</span>
        <button
          onClick={clearNotification}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            marginLeft: '12px',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ×
        </button>
      </div>
    </>
  );
};

export default Notification;
