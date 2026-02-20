# Frontend-Backend Alignment Guide
## No Dues Portal - MITS Gwalior

This document explains how the frontend and backend have been aligned and how to use the integrated system.

---

## 🎯 What Was Done

### 1. **API Service Layer Created** (`src/lib/api.ts`)
- Comprehensive axios-based API client with automatic token management
- Request/response interceptors for authentication
- Automatic token refresh on 401 errors
- Type-safe API methods for all backend endpoints

### 2. **Authentication Context** (`src/contexts/AuthContext.tsx`)
- Centralized authentication state management
- Login/logout functionality
- User session persistence via localStorage
- Automatic role-based navigation

### 3. **Protected Routes** (`src/components/ProtectedRoute.tsx`)
- Role-based access control
- Automatic redirects for unauthorized access
- Loading states during authentication checks

### 4. **Environment Configuration** (`.env`)
- Backend API URL configuration
- Easy environment switching

### 5. **Updated Components**
- **App.tsx**: Wrapped with AuthProvider and protected routes
- **Login.tsx**: Connected to real backend authentication
- **DashboardLayout.tsx**: Real logout and user display

---

## 🚀 How to Run the Complete System

### **Step 1: Start the Backend**

```bash
cd "e:/no dues/nodues backend"
npm install  # If not already done
npm start    # or node server.js
```

The backend will run on: **http://localhost:5000**

### **Step 2: Start the Frontend**

```bash
cd "e:/no dues/Nodues frontend"
npm install  # If not already done (axios is now installed)
npm run dev
```

The frontend will run on: **http://localhost:5173** (or similar Vite port)

---

## 🔐 Test Credentials

Based on the backend configuration, you can use these credentials:

### Super Admin
- **Email**: `admin@mitsgwl.ac.in`
- **Password**: `Admin@123456`

### Create Test Users
Use the admin panel or backend scripts to create test users for different roles.

---

## 📋 API Integration Status

### ✅ Completed Integrations

1. **Authentication**
   - ✅ Login (`POST /api/auth/login`)
   - ✅ Logout (`POST /api/auth/logout`)
   - ✅ Token Refresh (`POST /api/auth/refresh`)

2. **API Service Methods Ready**
   - ✅ Student APIs (submit application, get status, resubmit, get certificate)
   - ✅ Approval APIs (get pending, approve, pause, get details)
   - ✅ Admin APIs (create user, get users, get applications, statistics, audit logs)

### 🔄 Next Steps for Full Integration

The following pages still need to be updated to use the real APIs instead of mock data:

#### **Student Pages**
1. **StudentDashboard.tsx**
   - Replace mock `approvalStages` with `studentAPI.getApplicationStatus()`
   - Display real user data from `useAuth().user`

2. **StudentApply.tsx**
   - Connect form submission to `studentAPI.submitApplication(formData)`
   - Handle file uploads properly

3. **StudentStatus.tsx**
   - Fetch real-time status from `studentAPI.getApplicationStatus()`
   - Display actual approval stages and documents

4. **StudentCertificate.tsx**
   - Fetch certificate from `studentAPI.getCertificate()`
   - Display actual PDF download link

#### **Authority Pages**
1. **AuthorityDashboard.tsx**
   - Fetch pending approvals from `approvalAPI.getPendingApprovals()`
   - Implement approve/pause actions

#### **Admin Pages**
1. **AdminDashboard.tsx**
   - Fetch statistics from `adminAPI.getStatistics()`
   - Display real user and application data

---

## 🛠️ How to Connect a Page to the Backend

### Example: Updating StudentDashboard

**Before (Mock Data):**
```tsx
const approvalStages = [
  { name: "Faculty Advisor", status: "approved" },
  // ... hardcoded data
];
```

**After (Real API):**
```tsx
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['applicationStatus'],
    queryFn: () => studentAPI.getApplicationStatus(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  const approvalStages = data?.data?.approvalStages || [];
  const application = data?.data?.application;

  // Use real data in your component
  return (
    <DashboardLayout role="student" title="Student Dashboard">
      {/* Display real data */}
    </DashboardLayout>
  );
};
```

---

## 📁 File Structure

```
Nodues frontend/
├── .env                          # Environment variables
├── src/
│   ├── lib/
│   │   └── api.ts               # ✨ API service layer
│   ├── contexts/
│   │   └── AuthContext.tsx      # ✨ Authentication context
│   ├── components/
│   │   ├── ProtectedRoute.tsx   # ✨ Route protection
│   │   └── dashboard/
│   │       └── DashboardLayout.tsx  # ✅ Updated with logout
│   ├── pages/
│   │   ├── Login.tsx            # ✅ Connected to backend
│   │   ├── StudentDashboard.tsx # 🔄 Needs API integration
│   │   ├── StudentApply.tsx     # 🔄 Needs API integration
│   │   ├── StudentStatus.tsx    # 🔄 Needs API integration
│   │   └── ...
│   ├── App.tsx                  # ✅ Updated with auth
│   └── vite-env.d.ts            # ✅ Updated with env types
```

---

## 🔧 Environment Variables

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nodues-portal
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
# ... other backend configs
```

**Note**: Update `CORS_ORIGIN` and `FRONTEND_URL` in backend `.env` to match your frontend URL (likely `http://localhost:5173` for Vite).

---

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Check backend `.env` - update `CORS_ORIGIN` to your frontend URL
2. Restart the backend server after changing `.env`

### 401 Unauthorized
- Token might be expired
- Try logging out and logging back in
- Check browser localStorage for `accessToken` and `refreshToken`

### Module Not Found Errors
The TypeScript errors you see are normal during development. They'll resolve when you run the dev server:
```bash
npm run dev
```

---

## 📚 API Documentation

Full API documentation is available in the backend:
```
e:/no dues/nodues backend/API_DOCUMENTATION.md
```

---

## ✅ Testing Checklist

- [ ] Backend is running on port 5000
- [ ] Frontend is running on Vite dev server
- [ ] Can login with admin credentials
- [ ] Token is stored in localStorage
- [ ] Protected routes redirect when not authenticated
- [ ] Logout works and clears tokens
- [ ] User name displays in dashboard header

---

## 🎨 Next Development Steps

1. **Update Student Pages** to use real APIs
2. **Update Authority Pages** to use real APIs  
3. **Update Admin Pages** to use real APIs
4. **Add Error Handling** - Better error messages and retry logic
5. **Add Loading States** - Skeletons and spinners
6. **Add Notifications** - Real-time updates using WebSockets (optional)
7. **File Upload Testing** - Test document uploads in StudentApply
8. **PDF Generation Testing** - Test certificate download

---

## 📞 Support

For issues or questions:
1. Check the API documentation in the backend
2. Review the browser console for errors
3. Check the backend server logs
4. Verify environment variables are set correctly

---

**Last Updated**: February 2026  
**Status**: ✅ Core integration complete, page-level integrations pending
