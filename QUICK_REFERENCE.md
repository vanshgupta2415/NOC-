# Quick Reference - No Dues Portal Integration

## 🚀 Quick Start Commands

### Start Everything
```powershell
.\start-servers.ps1
```

### Start Individually
```bash
# Backend
cd "e:/no dues/nodues backend"
npm start

# Frontend
cd "e:/no dues/Nodues frontend"
npm run dev
```

---

## 🔐 Test Credentials

```
Email:    admin@mitsgwl.ac.in
Password: Admin@123456
```

---

## 📡 API Endpoints Quick Reference

### Authentication
```typescript
// Login
authAPI.login(email, password)
// Returns: { accessToken, refreshToken, user }

// Logout
authAPI.logout()
```

### Student APIs
```typescript
// Submit application
studentAPI.submitApplication(formData)

// Get status
studentAPI.getApplicationStatus()

// Resubmit
studentAPI.resubmitApplication(formData)

// Get certificate
studentAPI.getCertificate()
```

### Approval APIs
```typescript
// Get pending approvals
approvalAPI.getPendingApprovals(page, limit)

// Approve application
approvalAPI.approveApplication(applicationId)

// Pause application
approvalAPI.pauseApplication(applicationId, remarks)

// Get details
approvalAPI.getApplicationDetails(applicationId)
```

### Admin APIs
```typescript
// Create user
adminAPI.createUser(userData)

// Get all users
adminAPI.getAllUsers(params)

// Get statistics
adminAPI.getStatistics()

// Get audit logs
adminAPI.getAuditLogs(params)
```

---

## 🎣 React Hooks Usage

### Authentication
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

### API Queries (GET)
```typescript
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['applicationStatus'],
  queryFn: () => studentAPI.getApplicationStatus(),
});
```

### API Mutations (POST/PUT/DELETE)
```typescript
import { useMutation } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';

const mutation = useMutation({
  mutationFn: (formData) => studentAPI.submitApplication(formData),
  onSuccess: (data) => {
    console.log('Success:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Use it
mutation.mutate(formData);
```

---

## 🛡️ Protected Routes

```typescript
<ProtectedRoute allowedRoles={['Student']}>
  <StudentDashboard />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['SuperAdmin']}>
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['Faculty', 'HOD', 'LibraryAdmin']}>
  <AuthorityDashboard />
</ProtectedRoute>
```

---

## 📝 Common Patterns

### Loading State
```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
```

### Error State
```typescript
if (error) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
        <p>Error loading data</p>
      </CardContent>
    </Card>
  );
}
```

### Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('field', value);
  formData.append('file', fileInput.files[0]);
  
  try {
    const result = await studentAPI.submitApplication(formData);
    toast({ title: 'Success', description: result.message });
  } catch (error) {
    toast({ 
      title: 'Error', 
      description: error.response?.data?.message,
      variant: 'destructive' 
    });
  }
};
```

---

## 🎨 Component Templates

### Page with API Data
```typescript
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const MyPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData'],
    queryFn: () => studentAPI.someMethod(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <DashboardLayout role="student" title="My Page">
      {/* Use data here */}
      <div>{data?.data?.someField}</div>
    </DashboardLayout>
  );
};
```

### Form with Mutation
```typescript
import { useMutation } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const MyForm = () => {
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: studentAPI.submitApplication,
    onSuccess: () => {
      toast({ title: 'Success!' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
};
```

---

## 🔍 Debugging Tips

### Check Authentication
```javascript
// In browser console
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
localStorage.getItem('user')
```

### Clear Authentication
```javascript
// In browser console
localStorage.clear()
// Then refresh page
```

### Check API Response
```typescript
const { data } = useQuery({
  queryKey: ['test'],
  queryFn: () => studentAPI.getApplicationStatus(),
  onSuccess: (data) => console.log('API Response:', data),
  onError: (error) => console.error('API Error:', error),
});
```

### Network Tab
- Open DevTools → Network
- Filter by "Fetch/XHR"
- Check request headers (Authorization)
- Check response status and body

---

## 🐛 Common Issues & Fixes

### CORS Error
```
❌ Access to fetch blocked by CORS policy
✅ Fix: Update backend .env
   CORS_ORIGIN=http://localhost:5173
   Then restart backend
```

### 401 Unauthorized
```
❌ Request failed with status 401
✅ Fix: Clear localStorage and login again
   localStorage.clear()
```

### Module Not Found
```
❌ Cannot find module 'axios'
✅ Fix: Install dependencies
   npm install
```

### Token Expired
```
❌ Token has expired
✅ Fix: Automatic - axios interceptor will refresh
   Or logout and login again
```

---

## 📊 Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // Validation errors (optional)
  ]
}
```

---

## 🔗 URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **API Base:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

---

## 📚 Documentation Files

- `ALIGNMENT_SUMMARY.md` - What was done
- `FRONTEND_BACKEND_ALIGNMENT.md` - Detailed guide
- `ARCHITECTURE.md` - System architecture
- `API_DOCUMENTATION.md` - Full API reference (in backend folder)

---

## ✅ Pre-flight Checklist

Before starting development:
- [ ] MongoDB is running
- [ ] Backend .env is configured
- [ ] Frontend .env is configured
- [ ] Dependencies installed (npm install)
- [ ] Both servers are running
- [ ] Can access frontend in browser
- [ ] Can login successfully
- [ ] No console errors

---

**Quick Help:**
- Can't login? Check MongoDB is running
- CORS error? Check backend CORS_ORIGIN
- 401 error? Clear localStorage and re-login
- Module error? Run npm install
