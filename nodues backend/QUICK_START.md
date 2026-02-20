# 🚀 Quick Start Guide - No Dues Backend

## Prerequisites
- Node.js v14+ installed
- MongoDB running locally or remote connection
- npm or yarn package manager

---

## 📦 Installation

```bash
# Navigate to backend directory
cd "e:\no dues\nodues backend"

# Install dependencies (if not already done)
npm install
```

---

## ⚙️ Configuration

### 1. Environment Variables
Ensure your `.env` file is properly configured:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/nodues_portal

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:8080
FRONTEND_URL=http://localhost:8080

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@mitsgwl.ac.in
EMAIL_FROM_NAME=MITS No Dues Portal

# File Upload
UPLOAD_DIR=./uploads
CERTIFICATE_DIR=./certificates
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

---

## 🗄️ Database Setup

### Start MongoDB
```bash
# If using local MongoDB
mongod

# Or if MongoDB is already running as a service, skip this step
```

### Seed Database (Optional)
```bash
# Create test users
node seed-users.js

# Or seed everything
node seed-all.js

# Create a specific student
node create-student.js

# Reset admin password
node reset-admin.js
```

---

## ▶️ Running the Server

### Development Mode
```bash
# Start the server
node server.js

# Or if you have nodemon installed
nodemon server.js
```

### Production Mode
```bash
# Set environment to production
$env:NODE_ENV="production"

# Start the server
node server.js
```

---

## 🧪 Testing

### Test Backend Functionality
```bash
# Run comprehensive test
node test-backend-complete.js

# Test database connection
node test-db.js

# Test server startup
node test-server.js
```

### Using Postman
1. Import `postman_collection.json`
2. Set up environment variables in Postman
3. Test all endpoints

---

## 📊 Server Endpoints

### Health Check
```
GET http://localhost:5000/health
```

### API Base URL
```
http://localhost:5000/api
```

### Main Routes
- `/api/auth` - Authentication
- `/api/student` - Student operations
- `/api/approvals` - Approval workflow
- `/api/admin` - Admin operations

---

## 🔍 Monitoring

### Check Logs
```bash
# View error logs
Get-Content logs/error.log

# View combined logs
Get-Content logs/combined.log

# View exceptions
Get-Content logs/exceptions.log
```

### Server Output
The server will display:
- ✅ Database connection status
- ✅ Server port
- ✅ Environment mode
- ⚠️ Any warnings or errors

---

## 🛠️ Common Commands

### Stop Server
```
Ctrl + C
```

### Clear Logs
```bash
Remove-Item logs/*.log
```

### Check Running Processes
```bash
# Find Node processes
Get-Process node

# Kill specific process
Stop-Process -Id <ProcessID>
```

---

## 📝 Default Test Users

After running `seed-users.js`, you'll have:

### SuperAdmin
- Email: `admin@mitsgwl.ac.in`
- Password: `Admin@123`

### Student
- Email: `student1@mitsgwl.ac.in`
- Password: `Student@123`

### Faculty
- Email: `faculty1@mitsgwl.ac.in`
- Password: `Faculty@123`

(See `seed-users.js` for complete list)

---

## 🔧 Troubleshooting

### Server Won't Start
1. Check if MongoDB is running
2. Verify `.env` file exists and is configured
3. Check if port 5000 is available
4. Review error logs

### Database Connection Failed
1. Verify MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Ensure database permissions

### Email Not Sending
1. Verify SMTP credentials
2. Check email configuration in `.env`
3. For Gmail, use App Password

### File Upload Issues
1. Check `UPLOAD_DIR` exists
2. Verify file size limits
3. Check allowed file types

---

## 📚 Documentation

- `README.md` - Project overview
- `API_DOCUMENTATION.md` - Complete API reference
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DEPLOYMENT_CHECKLIST.md` - Production deployment
- `BACKEND_COMPLETION_REPORT.md` - Feature completion
- `FINAL_COMPLETION_CHECKLIST.md` - Complete checklist

---

## 🎯 Quick Test Flow

1. **Start Server**
   ```bash
   node server.js
   ```

2. **Test Health**
   ```
   GET http://localhost:5000/health
   ```

3. **Login**
   ```
   POST http://localhost:5000/api/auth/login
   Body: { "email": "admin@mitsgwl.ac.in", "password": "Admin@123" }
   ```

4. **Get Current User**
   ```
   GET http://localhost:5000/api/auth/me
   Headers: { "Authorization": "Bearer <token>" }
   ```

---

## ✅ Verification Checklist

Before using the backend, verify:
- [ ] MongoDB is running
- [ ] `.env` file is configured
- [ ] Dependencies are installed
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Can login successfully
- [ ] Database is seeded (optional)

---

## 🚀 You're Ready!

The backend is now running and ready to handle requests from the frontend!

**Server URL:** `http://localhost:5000`  
**API Base:** `http://localhost:5000/api`  
**Health Check:** `http://localhost:5000/health`

---

**Need Help?** Check the documentation files or review the error logs.
