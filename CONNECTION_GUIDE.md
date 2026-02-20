# 🔌 Frontend-Backend Connection Guide

## ✅ Connection Status: FIXED

The frontend and backend are now properly connected!

### 🔧 Issue Identified and Fixed

**Problem**: CORS (Cross-Origin Resource Sharing) was blocking requests from the frontend.

**Root Cause**: The backend CORS configuration was set to accept requests from `http://localhost:3000`, but the frontend is running on `http://localhost:8080`.

**Solution**: Updated `server.js` line 24 to:
```javascript
origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
```

---

## 🌐 Current Configuration

### Frontend
- **URL**: http://localhost:8080
- **API Base URL**: http://localhost:5000/api
- **Environment File**: `Nodues frontend/.env`
  ```
  VITE_API_BASE_URL=http://localhost:5000/api
  ```

### Backend
- **URL**: http://localhost:5000
- **API Routes**: http://localhost:5000/api/*
- **Health Check**: http://localhost:5000/health
- **CORS Origin**: http://localhost:8080
- **Credentials**: Enabled (cookies/auth tokens)

---

## 🧪 Testing the Connection

### Option 1: Use the Test Page
Visit: http://localhost:8080/test-connection.html

This page will automatically:
1. Test the health endpoint
2. Verify CORS configuration
3. Display connection status

### Option 2: Manual Browser Test
1. Open browser console (F12)
2. Run this code:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(data => console.log('✅ Connected:', data))
  .catch(err => console.error('❌ Error:', err));
```

### Option 3: Test Login API
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data));
```

---

## 📡 API Endpoints Available

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout

### Student (`/api/student`)
- `POST /application` - Submit no dues application
- `GET /application/status` - Get application status
- `PUT /application/resubmit` - Resubmit application
- `GET /certificate` - Download certificate

### Approvals (`/api/approvals`)
- `GET /pending` - Get pending approvals
- `POST /:applicationId/approve` - Approve application
- `POST /:applicationId/pause` - Pause application
- `GET /:applicationId/details` - Get details

### Admin (`/api/admin`)
- `POST /create-user` - Create new user
- `GET /users` - Get all users
- `PUT /users/:userId` - Update user
- `GET /applications` - Get all applications
- `GET /statistics` - Get system statistics
- `GET /audit-logs` - Get audit logs

---

## 🔐 Authentication Flow

1. **Login**: Frontend sends credentials to `/api/auth/login`
2. **Response**: Backend returns `accessToken` and `refreshToken`
3. **Storage**: Frontend stores tokens in `localStorage`
4. **Requests**: Frontend includes `Authorization: Bearer <accessToken>` header
5. **Refresh**: If token expires (401), frontend auto-refreshes using `/api/auth/refresh`

---

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Check backend is running: http://localhost:5000/health
2. Verify CORS origin in `nodues backend/server.js` line 24
3. Ensure `credentials: true` is set in both frontend and backend

### Connection Refused
If you see "Connection refused":
1. Verify backend is running: `npm run dev` in `nodues backend` folder
2. Check port 5000 is not blocked by firewall
3. Try accessing http://localhost:5000/health directly

### 401 Unauthorized
If API calls return 401:
1. Check if you're logged in
2. Verify `accessToken` exists in localStorage
3. Check token hasn't expired (15 minutes default)

### Network Errors
If you see network errors:
1. Open browser DevTools → Network tab
2. Check if request is being sent
3. Look at request headers (should include Authorization)
4. Check response status and body

---

## ✨ Next Steps

1. **Create Test User**: Use the admin API to create a test user
2. **Test Login**: Try logging in from the frontend
3. **Submit Application**: Test the student application flow
4. **Test Approvals**: Test the approval workflow

---

## 📝 Notes

- Backend automatically restarts on file changes (nodemon)
- Frontend has hot module replacement (HMR)
- All API responses follow the format:
  ```json
  {
    "success": true/false,
    "message": "...",
    "data": { ... }
  }
  ```
- Tokens are stored in localStorage
- Cookies are used for refresh token (httpOnly recommended for production)

---

## 🎉 Success!

Your frontend and backend are now connected and ready for development!
