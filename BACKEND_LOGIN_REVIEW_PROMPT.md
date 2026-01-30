# Backend Login Process Review & Implementation Prompt

## Current Frontend Implementation Status

The frontend has been updated to require authentication for order placement with the following features:

### ✅ Implemented Features:
1. **Authentication Context** - Centralized auth state management
2. **Login Requirement** - All order placements now require authentication
3. **Auto-redirect to Login** - Users are redirected to login page when trying to place orders
4. **Notifications System** - User-friendly notifications for login requirements
5. **Auto-order Placement** - After successful login, pending orders are automatically placed
6. **Logout Functionality** - Proper logout with state cleanup and redirect

### 🔧 Backend Requirements Checklist

Please review and implement the following backend requirements to ensure complete compatibility:

## 1. Authentication Endpoints

### Required Endpoints:
```
POST /api/auth/login
POST /api/auth/signup  
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/verify-otp (if using OTP verification)
```

### Login Endpoint (`POST /api/auth/login`)
**Expected Request:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+1234567890"
  }
}
```

**Expected Response (Error):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### User Profile Endpoint (`GET /api/auth/me`)
**Expected Response (Authenticated):**
```json
{
  "id": "user_id",
  "email": "user@example.com", 
  "name": "User Name",
  "phone": "+1234567890"
}
```

**Expected Response (Unauthenticated):**
- HTTP Status: 401
- No response body or error message

### Logout Endpoint (`POST /api/auth/logout`)
**Requirements:**
- Clear HTTP-only cookies
- Invalidate session/token
- Return HTTP 200 on success

## 2. Order Placement Authentication

### Order Creation Endpoint (`POST /api/orders`)
**Authentication Required:** YES

**Expected Behavior:**
1. Check for valid authentication (session/token/cookies)
2. If unauthenticated, return HTTP 401 with error message
3. If authenticated, proceed with order creation

**Expected Error Response (Unauthenticated):**
```json
{
  "success": false,
  "message": "Authentication required to place orders"
}
```

## 3. Cookie/Session Management

### Requirements:
1. **HTTP-only Cookies** for session tokens
2. **Secure Flag** for production (HTTPS only)
3. **SameSite Policy** for CSRF protection
4. **CORS Configuration** to allow credentials from frontend

### Example Cookie Configuration:
```javascript
// Set cookie after successful login
res.cookie('sessionId', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});
```

## 4. CORS Configuration

### Required CORS Settings:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 5. Security Considerations

### Must Implement:
1. **Password Hashing** (bcrypt, scrypt, or Argon2)
2. **Rate Limiting** on login endpoints
3. **Input Validation** and sanitization
4. **SQL Injection Prevention** (if using SQL database)
5. **Session Management** with proper expiration

### Password Hashing Example:
```javascript
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Hash password
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

## 6. Database Schema Requirements

### Users Table Structure:
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Orders Table - User Reference:
```sql
ALTER TABLE orders 
ADD COLUMN user_id VARCHAR(36),
ADD FOREIGN KEY (user_id) REFERENCES users(id);
```

## 7. Error Handling Standards

### Consistent Error Response Format:
```json
{
  "success": false,
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

### HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden  
- 409: Conflict (duplicate email, etc.)
- 500: Internal Server Error

## 8. Testing Requirements

### Test Cases to Implement:
1. **Login Flow** - Valid/invalid credentials
2. **Session Management** - Cookie setting/clearing
3. **Order Placement** - Authenticated vs unauthenticated
4. **Logout Flow** - Session invalidation
5. **User Profile** - Authentication check
6. **CORS** - Cross-origin requests with credentials

## 9. Environment Variables

### Required Environment Variables:
```bash
# Database
DATABASE_URL=your_database_connection_string

# JWT/Session Secret
SESSION_SECRET=your_super_secret_key_here

# CORS
FRONTEND_URL=http://localhost:3000

# Email (if using email verification)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_email_password
```

## 10. Implementation Priority

### Phase 1 - Core Authentication:
1. ✅ Login/logout endpoints
2. ✅ User profile endpoint  
3. ✅ Session management
4. ✅ Basic order authentication

### Phase 2 - Security & Validation:
1. Password hashing
2. Input validation
3. Rate limiting
4. CORS configuration

### Phase 3 - Advanced Features:
1. Email verification (if needed)
2. Password reset
3. Account management
4. Role-based permissions

## Frontend-Backend Integration Notes

### Cookie Handling:
- Frontend uses `credentials: 'include'` for all requests
- Backend must set HTTP-only cookies for session management
- No manual token handling in localStorage (security best practice)

### Error Handling:
- Frontend expects consistent error message format
- All authentication errors should return HTTP 401
- Validation errors should return HTTP 400 with descriptive messages

### Order Flow:
1. User attempts to place order
2. Frontend calls `requireAuth()` which redirects to login if needed
3. After successful login, frontend automatically places pending order
4. Backend validates authentication and creates order

## Testing the Integration

### Manual Testing Steps:
1. Clear browser cookies/localStorage
2. Add items to cart and proceed to checkout
3. Fill billing details and attempt to place order
4. Should redirect to login page with notification
5. Login with valid credentials
6. Should automatically place order and redirect to order status
7. Test logout functionality
8. Verify unauthenticated users cannot access protected endpoints

### Automated Testing:
```javascript
// Example test case
describe('Order Authentication', () => {
  test('should require login for order placement', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send(orderData)
      .expect(401);
    
    expect(response.body.message).toBe('Authentication required to place orders');
  });
});
```

---

## 🚨 Action Required

Please review this comprehensive list and implement any missing backend functionality. The frontend is ready and waiting for these backend endpoints to be properly secured and functional.

**Key Focus Areas:**
1. Authentication middleware for order endpoints
2. Proper session/cookie management
3. Consistent error handling
4. Security best practices

Once implemented, the complete login-to-order flow will work seamlessly with automatic order placement after authentication.
