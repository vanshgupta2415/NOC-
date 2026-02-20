# Online No Dues Portal - MITS Gwalior Backend

A secure, role-based backend system for automating the No Dues certificate process for engineering colleges. This system replaces manual Google Form + Excel workflows with an automated, multi-stage approval system.

## 🎯 Features

- **Multi-Role Authentication**: JWT-based auth with role-based access control (RBAC)
- **Automated Workflow**: Configurable multi-stage approval process
- **Document Management**: Secure file upload and storage
- **Email Automation**: Automatic notifications and certificate delivery
- **PDF Generation**: Server-side No Dues certificate generation
- **Audit Logging**: Complete audit trail for all approvals
- **Admin Dashboard**: Comprehensive system management and analytics

## 🏗️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access + Refresh Tokens)
- **File Upload**: Multer
- **PDF Generation**: Puppeteer
- **Email**: Nodemailer (SMTP)
- **Validation**: Zod
- **Security**: Helmet, bcrypt, CORS, Rate Limiting
- **Logging**: Winston

## 👥 User Roles

### Student
- Submit No Dues application
- Upload required documents
- Track application status
- Resubmit paused applications
- Download certificate

### Department Roles
- **Faculty**: First-level approval
- **Class Coordinator**: Second-level approval
- **HOD**: Department head approval

### Central Office Roles
- **Hostel Admin**: Hostel clearance (if applicable)
- **Library Admin**: Library clearance
- **Workshop/Lab Admin**: Workshop clearance
- **T&P Cell Admin**: Training & Placement clearance
- **General Office Admin**: General office clearance
- **Accounts Office**: Final approval & certificate generation

### Super Admin
- Create and manage users
- Configure approval workflow
- Monitor all applications
- View audit logs
- Generate system reports

## 📁 Project Structure

```
nodues-backend/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── email.js             # Email configuration
│   ├── logger.js            # Winston logger setup
│   └── workflow.js          # Approval workflow config
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── studentController.js # Student operations
│   ├── approvalController.js# Approval operations
│   └── adminController.js   # Admin operations
├── middleware/
│   ├── auth.js              # JWT authentication & authorization
│   ├── validation.js        # Request validation
│   ├── upload.js            # File upload handling
│   ├── errorHandler.js      # Global error handler
│   └── audit.js             # Audit logging
├── models/
│   ├── User.js              # User model
│   ├── StudentProfile.js    # Student details
│   ├── NoDuesApplication.js # Application model
│   ├── Documents.js         # Document storage
│   ├── ApprovalStage.js     # Approval stages
│   ├── Certificate.js       # Certificate records
│   └── AuditLog.js          # Audit trail
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── studentRoutes.js     # Student endpoints
│   ├── approvalRoutes.js    # Approval endpoints
│   └── adminRoutes.js       # Admin endpoints
├── utils/
│   ├── certificateGenerator.js # PDF generation
│   └── emailTemplates.js    # Email templates
├── uploads/                 # Uploaded documents
├── certificates/            # Generated certificates
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Gmail account (for SMTP) or other email service

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodues-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your configuration:
   ```env
   # Server
   NODE_ENV=development
   PORT=5000
   CORS_ORIGIN=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/nodues-portal

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d

   # Email (Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=noreply@mitsgwl.ac.in

   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   CERTIFICATE_PATH=./certificates
   ```

4. **Create required directories**
   ```bash
   mkdir uploads certificates
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📧 Email Configuration

### Using Gmail

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `SMTP_PASS`

### Using Other SMTP Services

Update the SMTP configuration in `.env`:
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: `email-smtp.region.amazonaws.com:587`

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/login          # Login
POST   /api/auth/refresh        # Refresh token
POST   /api/auth/logout         # Logout
```

### Student
```
POST   /api/student/application          # Submit application
GET    /api/student/application/status   # Get status
PUT    /api/student/application/resubmit # Resubmit
GET    /api/student/certificate          # Download certificate
```

### Approvals
```
GET    /api/approvals/pending                    # Get pending
POST   /api/approvals/:id/approve                # Approve
POST   /api/approvals/:id/pause                  # Pause
GET    /api/approvals/:id/details                # Get details
```

### Admin
```
POST   /api/admin/create-user              # Create user
GET    /api/admin/users                    # List users
PUT    /api/admin/users/:id                # Update user
DELETE /api/admin/users/:id                # Deactivate user
GET    /api/admin/applications             # List applications
GET    /api/admin/applications/:id         # Get application
GET    /api/admin/audit-logs               # Audit logs
PUT    /api/admin/configure-workflow       # Configure workflow
GET    /api/admin/workflow-config          # Get workflow
GET    /api/admin/statistics               # System stats
POST   /api/admin/regenerate-certificate/:id # Regenerate cert
```

## 🔄 Approval Workflow

### Standard Workflow
1. Faculty
2. Class Coordinator
3. HOD
4. Library Admin
5. Workshop/Lab Admin
6. T&P Cell Admin
7. General Office Admin
8. Accounts Office (Final - triggers certificate)

### Hostel Workflow
Includes **Hostel Admin** after HOD stage.

### Workflow States
- **Submitted**: Initial state
- **UnderReview**: Being processed
- **Paused**: Dues pending (with remarks)
- **Approved**: All stages cleared
- **CertificateIssued**: Certificate generated & sent

## 📝 Creating First Admin User

Use MongoDB shell or Compass to create the first SuperAdmin:

```javascript
use nodues-portal

db.users.insertOne({
  name: "Super Admin",
  email: "admin@mitsgwl.ac.in",
  passwordHash: "$2a$10$...", // Use bcrypt to hash password
  role: "SuperAdmin",
  department: null,
  isActive: true,
  createdAt: new Date()
})
```

Or use this Node.js script:

```javascript
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = require('./models/User');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  
  await User.create({
    name: 'Super Admin',
    email: 'admin@mitsgwl.ac.in',
    passwordHash,
    role: 'SuperAdmin',
    isActive: true
  });
  
  console.log('Admin created!');
  process.exit(0);
}

createAdmin();
```

## 🧪 Testing

### Manual Testing with Postman/Thunder Client

1. **Login**
   ```json
   POST /api/auth/login
   {
     "email": "admin@mitsgwl.ac.in",
     "password": "admin123"
   }
   ```

2. **Create Student**
   ```json
   POST /api/admin/create-user
   Headers: { "Authorization": "Bearer <token>" }
   {
     "name": "John Doe",
     "email": "john@mitsgwl.ac.in",
     "password": "student123",
     "role": "Student",
     "studentProfile": {
       "enrollmentNumber": "0801CS201234",
       "fatherName": "Father Name",
       "dateOfBirth": "2000-01-01",
       "branch": "Computer Science",
       "address": "Student Address",
       "passOutYear": 2024
     }
   }
   ```

3. **Submit Application** (as Student)
   ```
   POST /api/student/application
   Headers: { "Authorization": "Bearer <student-token>" }
   Form Data:
   - hostelInvolved: false
   - cautionMoneyRefund: true
   - declarationAccepted: true
   - feeReceipts: <file>
   - marksheets: <file>
   - bankProof: <file>
   - idProof: <file>
   ```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Separate access & refresh tokens
- **Rate Limiting**: 100 requests per 15 minutes
- **Helmet**: Security headers
- **CORS**: Configurable origins
- **Input Validation**: Zod schemas
- **File Validation**: Type and size checks
- **Audit Logging**: All critical actions logged

## 📊 Database Indexes

For optimal performance, create these indexes:

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Applications
db.noduesapplications.createIndex({ studentId: 1 })
db.noduesapplications.createIndex({ status: 1 })

// Approval Stages
db.approvalstages.createIndex({ applicationId: 1, stageOrder: 1 })
db.approvalstages.createIndex({ role: 1, status: 1 })

// Certificates
db.certificates.createIndex({ applicationId: 1 }, { unique: true })
db.certificates.createIndex({ certificateNumber: 1 }, { unique: true })
```

## 🌐 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production MongoDB URI
4. Set up proper SMTP service
5. Configure CORS for production domain

### Recommended Platforms
- **Backend**: Railway, Render, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas
- **File Storage**: AWS S3, Cloudinary (for production)

### Docker Deployment (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

## 🛠️ Customization

### Modify Workflow Stages

Edit `config/workflow.js`:

```javascript
const workflowStages = [
  { officeName: 'Faculty', role: 'Faculty' },
  { officeName: 'Your Custom Office', role: 'CustomRole' },
  // Add more stages
];
```

### Add New Roles

1. Update `models/User.js` role enum
2. Add role to workflow configuration
3. Update authorization middleware
4. Create corresponding routes

### Customize Email Templates

Edit `utils/emailTemplates.js` to modify email content and styling.

### Customize Certificate Design

Edit `utils/certificateGenerator.js` to change PDF layout and styling.

## 📞 Support

For issues or questions:
- Email: support@mitsgwl.ac.in
- Documentation: [Link to docs]

## 📄 License

This project is licensed for use by MITS Gwalior and can be adapted by other educational institutions.

## 🙏 Acknowledgments

Built for Madhav Institute of Technology & Science, Gwalior to streamline the No Dues process.

---

**Version**: 1.0.0  
**Last Updated**: February 2026
