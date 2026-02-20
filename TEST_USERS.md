# 🔐 Test User Credentials

## ✅ Users Created Successfully!

All test users have been created in the database. You can now log in with any of these accounts.

---

## 📋 Login Credentials

**Password for ALL users:** `password123`

### 1. 👨‍💼 Super Admin
- **Email:** `admin@mitsgwl.ac.in`
- **Role:** Super Admin
- **Access:** Full system access, user management, workflow configuration

### 2. 🎓 Student
- **Email:** `student@mitsgwl.ac.in`
- **Role:** Student
- **Department:** Computer Science
- **Enrollment:** 0827CS211001
- **Access:** Submit applications, view status, download certificate

### 3. 👨‍🏫 Faculty
- **Email:** `faculty@mitsgwl.ac.in`
- **Role:** Faculty
- **Department:** Computer Science
- **Access:** Approve applications at faculty stage

### 4. 👔 HOD
- **Email:** `hod@mitsgwl.ac.in`
- **Role:** Head of Department
- **Department:** Computer Science
- **Access:** Approve applications at HOD stage

### 5. 📚 Library Admin
- **Email:** `library@mitsgwl.ac.in`
- **Role:** Library Admin
- **Access:** Approve applications at library stage

---

## 🚀 Quick Start

1. **Go to:** http://localhost:8080
2. **Click:** Login/Sign In
3. **Enter credentials:** Use any email from above
4. **Password:** `password123`
5. **Click:** Login

---

## 🧪 Testing Workflow

### As Student:
1. Login with `student@mitsgwl.ac.in`
2. Submit a No Dues application
3. Upload required documents
4. Track application status

### As Faculty/HOD/Admin:
1. Login with respective credentials
2. View pending applications
3. Approve or pause applications
4. Add remarks if needed

### As Super Admin:
1. Login with `admin@mitsgwl.ac.in`
2. View all users and applications
3. Create new users
4. Configure workflow stages
5. View audit logs and statistics

---

## 🔄 Reset Password (If Needed)

If you need to reset passwords or create new users, run:
```powershell
cd "E:\no dues\nodues backend"
node seed-users.js
```

---

## 🐛 Troubleshooting

### Login Failed?
- ✅ Check you're using the correct email format
- ✅ Password is exactly: `password123` (case-sensitive)
- ✅ Backend server is running on port 5000
- ✅ Check browser console for error messages

### Can't See Applications?
- Students need to submit an application first
- Approvers will only see applications at their stage
- Super Admin can see all applications

---

## 📝 Notes

- All users are **active** by default
- Student has a complete profile already created
- All passwords are hashed using bcrypt
- Refresh tokens are managed automatically
- Session expires after 15 minutes (access token)

---

## 🎉 You're Ready!

Try logging in now with any of the credentials above!

**Frontend:** http://localhost:8080
