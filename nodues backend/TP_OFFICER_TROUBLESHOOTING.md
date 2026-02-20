# 🔧 T&P OFFICER TROUBLESHOOTING

## Issue: T&P Officer Cannot See Applications

---

## ✅ **VERIFIED**

1. ✅ T&P Officer user exists in database
2. ✅ TPOfficer approval stage exists for the application
3. ✅ Application status is "UnderReview"
4. ✅ Query logic is correct
5. ✅ Application matches the query criteria

---

## 🔍 **DIAGNOSIS**

The backend is working correctly. The issue is likely:

### **Possible Causes**:

1. **Wrong Login Credentials**
   - Using wrong email or password
   - User might be inactive

2. **Frontend Route Issue**
   - Frontend not calling the correct API endpoint
   - API response not being displayed

3. **Browser Cache**
   - Old frontend code cached
   - Need hard refresh

4. **Token Issue**
   - JWT token has wrong role
   - Token expired

---

## 🧪 **TESTING STEPS**

### **Step 1: Verify Login Credentials**

**Correct Credentials**:
```
Email: tp@mitsgwl.ac.in
Password: password123
```

### **Step 2: Check User in Database**

Run this to verify:
```bash
node debug-tp-officer.js
```

Expected output:
```
User found:
  Name: Training & Placement Officer
  Email: tp@mitsgwl.ac.in
  Role: TPOfficer
  Active: true
```

### **Step 3: Test API Directly**

**Using Browser Console** (F12):

1. **Login first**:
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'tp@mitsgwl.ac.in',
    password: 'password123'
  })
})
.then(r => r.json())
.then(d => {
  console.log('Login response:', d);
  localStorage.setItem('token', d.data.accessToken);
});
```

2. **Get pending approvals**:
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/approvals/pending', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Pending approvals:', d));
```

Expected: Should see the application in the response

### **Step 4: Check Frontend**

1. **Hard refresh**: `Ctrl + Shift + R`
2. **Clear cache**: Clear browser cache
3. **Check console**: Look for errors in browser console (F12)
4. **Check network**: Look at API calls in Network tab

---

## 🔧 **SOLUTIONS**

### **Solution 1: Re-seed Users**

If user doesn't exist or has wrong role:

```bash
cd "e:\no dues\nodues backend"
node seed-users-fixed.js
```

This will recreate all users with correct roles.

### **Solution 2: Hard Refresh Frontend**

```
Press: Ctrl + Shift + R (Windows)
Or: Cmd + Shift + R (Mac)
```

### **Solution 3: Check API Response**

Open browser console and check what the API returns:

```javascript
// After logging in as T&P Officer
fetch('http://localhost:5000/api/approvals/pending', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('API Response:', JSON.stringify(d, null, 2)));
```

---

## 📋 **CHECKLIST**

- [ ] T&P Officer user exists with role "TPOfficer"
- [ ] User is active (isActive: true)
- [ ] Application exists with status "UnderReview"
- [ ] TPOfficer approval stage exists with status "Pending"
- [ ] Login credentials are correct (tp@mitsgwl.ac.in / password123)
- [ ] Frontend has been hard refreshed
- [ ] Browser console shows no errors
- [ ] API endpoint returns data when tested directly

---

## 🎯 **QUICK FIX**

**Try this in order**:

1. **Logout** from current session
2. **Clear browser cache**
3. **Hard refresh** (Ctrl + Shift + R)
4. **Login as T&P Officer**:
   - Email: `tp@mitsgwl.ac.in`
   - Password: `password123`
5. **Navigate to Pending Approvals**
6. **Check if application appears**

---

## 💡 **EXPECTED BEHAVIOR**

When T&P Officer logs in:

1. ✅ Should see dashboard
2. ✅ Should see "Pending Approvals" menu
3. ✅ Should see the student's application in the list
4. ✅ Should be able to click and view details
5. ✅ Should be able to approve or pause

---

## 🐛 **IF STILL NOT WORKING**

### **Check These**:

1. **Backend Logs**:
   - Check terminal running `node server.js`
   - Look for errors when accessing /api/approvals/pending

2. **Frontend Logs**:
   - Open browser console (F12)
   - Look for errors or failed API calls

3. **Database**:
   - Verify application exists
   - Verify approval stage exists
   - Verify user exists

4. **Network Tab**:
   - Check if API call is made
   - Check response status (should be 200)
   - Check response data

---

## 📞 **DEBUG COMMANDS**

Run these to debug:

```bash
# Check T&P Officer user
node debug-tp-officer.js

# Test query logic
node test-tp-query.js

# Check all users
node show-credentials.js

# Check applications
node check-applications.js
```

---

## ✅ **VERIFICATION**

After fixing, verify:

1. **Login as T&P Officer**
2. **Go to Pending Approvals**
3. **Should see**: Student's application
4. **Click on it**: Should see details
5. **Approve**: Should work successfully

---

**Most likely cause**: Browser cache or wrong login credentials

**Quick fix**: Hard refresh + re-login

---

**Created**: February 11, 2026, 23:12 IST  
**Status**: Debugging Guide  
**Backend**: Working correctly ✅  
**Issue**: Likely frontend/cache related
