# Quick Setup Guide - No Dues Portal Backend

This guide will help you get the No Dues Portal backend up and running in minutes.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js (v16 or higher) - [Download](https://nodejs.org/)
- ✅ MongoDB (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- ✅ Gmail account (for email notifications)
- ✅ Code editor (VS Code recommended)
- ✅ API testing tool (Postman/Thunder Client)

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

**Minimum Required Configuration:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/nodues-portal

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Email (Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### Step 3: Start MongoDB

**Windows:**
```bash
# If MongoDB is installed as a service, it should already be running
# Otherwise, run:
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 4: Create Admin User

```bash
node scripts/seedAdmin.js
```

You'll see:
```
✅ SuperAdmin created successfully!

Login Credentials:
==================
Email: admin@mitsgwl.ac.in
Password: admin123
```

### Step 5: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
🚀 Server running on port 5000
```

### Step 6: Test the API

Open Postman and import `postman_collection.json`, or use curl:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mitsgwl.ac.in","password":"admin123"}'
```

✅ **You're all set!** The backend is now running.

---

## 📧 Gmail Setup (Important!)

To send emails, you need a Gmail App Password:

### Step-by-Step:

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "No Dues Portal"
   - Copy the 16-character password

3. **Update .env**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # The 16-char password
   ```

---

## 🧪 Testing with Sample Data

Want to test the complete workflow? Seed sample users:

```bash
node scripts/seedTestUsers.js
```

This creates:
- ✅ All authority roles (Faculty, HOD, Library Admin, etc.)
- ✅ 3 sample students
- ✅ Complete approval chain

**Sample Login Credentials:**

| Role | Email | Password |
|------|-------|----------|
| SuperAdmin | admin@mitsgwl.ac.in | admin123 |
| Faculty | faculty1@mitsgwl.ac.in | faculty123 |
| Class Coordinator | coordinator1@mitsgwl.ac.in | coordinator123 |
| HOD | hod.cs@mitsgwl.ac.in | hod123 |
| Library Admin | library.admin@mitsgwl.ac.in | library123 |
| Student | rahul.sharma@mitsgwl.ac.in | student123 |

---

## 🔄 Complete Workflow Test

### 1. Login as Student
```bash
POST /api/auth/login
{
  "email": "rahul.sharma@mitsgwl.ac.in",
  "password": "student123"
}
```

### 2. Submit Application
```bash
POST /api/student/application
Headers: { "Authorization": "Bearer <student-token>" }
Form Data:
- hostelInvolved: false
- cautionMoneyRefund: true
- declarationAccepted: true
- feeReceipts: <upload PDF>
- marksheets: <upload PDF>
- bankProof: <upload image>
- idProof: <upload image>
```

### 3. Login as Faculty
```bash
POST /api/auth/login
{
  "email": "faculty1@mitsgwl.ac.in",
  "password": "faculty123"
}
```

### 4. View Pending Approvals
```bash
GET /api/approvals/pending
Headers: { "Authorization": "Bearer <faculty-token>" }
```

### 5. Approve Application
```bash
POST /api/approvals/{applicationId}/approve
Headers: { "Authorization": "Bearer <faculty-token>" }
```

### 6. Repeat for Each Authority
Login as each role and approve:
- Class Coordinator
- HOD
- Library Admin
- Workshop Admin
- T&P Cell Admin
- General Office Admin
- Accounts Office (final - triggers certificate)

---

## 📁 Directory Structure

```
nodues-backend/
├── config/              # Configuration files
├── controllers/         # Business logic
├── middleware/          # Auth, validation, etc.
├── models/             # Database schemas
├── routes/             # API routes
├── scripts/            # Seed scripts
├── utils/              # Helper functions
├── uploads/            # Uploaded documents
├── certificates/       # Generated PDFs
├── .env                # Environment variables
├── server.js           # Entry point
└── README.md           # Full documentation
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change port in `.env`
```env
PORT=5001
```

### Email Not Sending
**Check:**
1. ✅ Gmail App Password is correct (16 characters)
2. ✅ 2FA is enabled on Gmail
3. ✅ SMTP_USER and SMTP_PASS are set in .env
4. ✅ No spaces in the app password

### JWT Token Error
```
Error: jwt malformed
```
**Solution:** Ensure JWT secrets are at least 32 characters long

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up MongoDB authentication
- [ ] Use cloud storage for files (S3/Cloudinary)
- [ ] Set up proper logging and monitoring

---

## 📚 Next Steps

1. **Read Full Documentation**: Check `README.md` for complete API docs
2. **Import Postman Collection**: Use `postman_collection.json` for testing
3. **Customize Workflow**: Edit `config/workflow.js` for your institution
4. **Build Frontend**: Connect your React/Vue/Angular frontend
5. **Deploy**: Follow deployment guide in README.md

---

## 🆘 Need Help?

- 📖 Full Documentation: `README.md`
- 🐛 Issues: Check troubleshooting section
- 📧 Support: support@mitsgwl.ac.in

---

**Happy Coding! 🚀**
