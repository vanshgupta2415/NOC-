# API Documentation - No Dues Portal

Complete API reference for the MITS Gwalior No Dues Portal backend.

**Base URL:** `http://localhost:5000/api`

**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Student Endpoints](#student-endpoints)
3. [Approval Endpoints](#approval-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Response Formats](#response-formats)
6. [Error Codes](#error-codes)

---

## Authentication

### Login

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@mitsgwl.ac.in",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@mitsgwl.ac.in",
      "role": "Student"
    }
  }
}
```

---

### Refresh Token

**Endpoint:** `POST /auth/refresh`

**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Logout

**Endpoint:** `POST /auth/logout`

**Access:** Private

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## Student Endpoints

### Submit Application

**Endpoint:** `POST /student/application`

**Access:** Private (Student only)

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Form Data:**
- `hostelInvolved` (boolean): Whether student stayed in hostel
- `cautionMoneyRefund` (boolean): Whether caution money refund is required
- `declarationAccepted` (boolean): Declaration acceptance
- `feeReceipts` (file): PDF of fee receipts
- `marksheets` (file): PDF of marksheets
- `bankProof` (file): Image of bank proof
- `idProof` (file): Image of ID proof

**Response (201):**
```json
{
  "status": "success",
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "507f1f77bcf86cd799439011",
    "status": "UnderReview",
    "currentStage": 0
  }
}
```

---

### Get Application Status

**Endpoint:** `GET /student/application/status`

**Access:** Private (Student only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "application": {
      "_id": "507f1f77bcf86cd799439011",
      "studentId": "507f1f77bcf86cd799439012",
      "status": "UnderReview",
      "currentStage": 2,
      "hostelInvolved": false,
      "cautionMoneyRefund": true,
      "createdAt": "2026-02-07T10:30:00.000Z"
    },
    "approvalStages": [
      {
        "officeName": "Faculty",
        "role": "Faculty",
        "status": "Approved",
        "approvedBy": {
          "name": "Dr. Rajesh Kumar",
          "email": "faculty1@mitsgwl.ac.in"
        },
        "approvedAt": "2026-02-07T11:00:00.000Z"
      },
      {
        "officeName": "Class Coordinator",
        "role": "ClassCoordinator",
        "status": "Approved",
        "approvedBy": {
          "name": "Prof. Priya Sharma",
          "email": "coordinator1@mitsgwl.ac.in"
        },
        "approvedAt": "2026-02-07T12:00:00.000Z"
      },
      {
        "officeName": "HOD",
        "role": "HOD",
        "status": "Pending",
        "approvedBy": null,
        "approvedAt": null
      }
    ],
    "documents": {
      "feeReceiptsPDF": "uploads/fee-receipts-1234567890.pdf",
      "marksheetsPDF": "uploads/marksheets-1234567890.pdf",
      "bankProofImage": "uploads/bank-proof-1234567890.jpg",
      "idProofImage": "uploads/id-proof-1234567890.jpg"
    },
    "certificate": null
  }
}
```

---

### Resubmit Application

**Endpoint:** `PUT /student/application/resubmit`

**Access:** Private (Student only)

**Form Data:**
- `applicationId` (string): Application ID
- `feeReceipts` (file, optional): Updated fee receipts
- `marksheets` (file, optional): Updated marksheets
- `bankProof` (file, optional): Updated bank proof
- `idProof` (file, optional): Updated ID proof

**Response (200):**
```json
{
  "status": "success",
  "message": "Application resubmitted successfully",
  "data": {
    "applicationId": "507f1f77bcf86cd799439011",
    "status": "UnderReview"
  }
}
```

---

### Get Certificate

**Endpoint:** `GET /student/certificate`

**Access:** Private (Student only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "certificateNumber": "MITS/ND/2026/001",
    "issuedAt": "2026-02-07T15:00:00.000Z",
    "pdfUrl": "/certificates/MITS-ND-2026-001.pdf",
    "emailSent": true
  }
}
```

---

## Approval Endpoints

### Get Pending Approvals

**Endpoint:** `GET /approvals/pending`

**Access:** Private (Approver roles)

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "applications": [
      {
        "applicationId": "507f1f77bcf86cd799439011",
        "student": {
          "name": "Rahul Sharma",
          "email": "rahul.sharma@mitsgwl.ac.in",
          "enrollmentNumber": "0801CS211001",
          "branch": "Computer Science & Engineering",
          "passOutYear": 2025
        },
        "applicationStatus": "UnderReview",
        "currentStage": 2,
        "hostelInvolved": false,
        "cautionMoneyRefund": true,
        "submittedAt": "2026-02-07T10:30:00.000Z",
        "documents": {
          "feeReceipts": "uploads/fee-receipts-1234567890.pdf",
          "marksheets": "uploads/marksheets-1234567890.pdf",
          "bankProof": "uploads/bank-proof-1234567890.jpg",
          "idProof": "uploads/id-proof-1234567890.jpg"
        },
        "stageInfo": {
          "officeName": "HOD",
          "stageOrder": 2
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

### Approve Application

**Endpoint:** `POST /approvals/:applicationId/approve`

**Access:** Private (Approver roles)

**Response (200):**
```json
{
  "status": "success",
  "message": "Application approved and moved to next stage",
  "data": {
    "applicationId": "507f1f77bcf86cd799439011",
    "status": "UnderReview",
    "currentStage": 3,
    "isFinalApproval": false
  }
}
```

**Response (200) - Final Approval:**
```json
{
  "status": "success",
  "message": "Application approved. Certificate generated and sent to student.",
  "data": {
    "applicationId": "507f1f77bcf86cd799439011",
    "status": "CertificateIssued",
    "isFinalApproval": true
  }
}
```

---

### Pause Application

**Endpoint:** `POST /approvals/:applicationId/pause`

**Access:** Private (Approver roles)

**Request Body:**
```json
{
  "remarks": "Library books not returned. Please clear dues of Rs. 500."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Application paused. Student has been notified.",
  "data": {
    "applicationId": "507f1f77bcf86cd799439011",
    "status": "Paused",
    "pausedAt": "Library Admin",
    "remarks": "Library books not returned. Please clear dues of Rs. 500."
  }
}
```

---

### Get Application Details

**Endpoint:** `GET /approvals/:applicationId/details`

**Access:** Private (Approver roles)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "application": { /* Application object */ },
    "student": {
      "name": "Rahul Sharma",
      "email": "rahul.sharma@mitsgwl.ac.in",
      "enrollmentNumber": "0801CS211001",
      "fatherName": "Mr. Mohan Sharma",
      "dateOfBirth": "2003-05-15",
      "branch": "Computer Science & Engineering",
      "address": "123, Model Town, Gwalior",
      "passOutYear": 2025
    },
    "documents": { /* Documents object */ },
    "approvalStages": [ /* Array of approval stages */ ]
  }
}
```

---

## Admin Endpoints

### Create User

**Endpoint:** `POST /admin/create-user`

**Access:** Private (SuperAdmin only)

**Request Body:**
```json
{
  "name": "Test Student",
  "email": "test.student@mitsgwl.ac.in",
  "password": "student123",
  "role": "Student",
  "department": null,
  "studentProfile": {
    "enrollmentNumber": "0801CS211999",
    "fatherName": "Mr. Test Father",
    "dateOfBirth": "2003-01-01",
    "branch": "Computer Science & Engineering",
    "address": "Test Address, Gwalior",
    "passOutYear": 2025
  }
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "name": "Test Student",
    "email": "test.student@mitsgwl.ac.in",
    "role": "Student"
  }
}
```

---

### Get All Users

**Endpoint:** `GET /admin/users`

**Access:** Private (SuperAdmin only)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `department` (string): Filter by department
- `search` (string): Search by name or email

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": [ /* Array of user objects */ ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

---

### Get All Applications

**Endpoint:** `GET /admin/applications`

**Access:** Private (SuperAdmin only)

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `branch`: Filter by branch
- `passOutYear`: Filter by pass out year

---

### Get Statistics

**Endpoint:** `GET /admin/statistics`

**Access:** Private (SuperAdmin only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 150,
      "active": 145,
      "byRole": [
        { "_id": "Student", "count": 100 },
        { "_id": "Faculty", "count": 20 },
        { "_id": "HOD", "count": 5 }
      ]
    },
    "applications": {
      "total": 75,
      "byStatus": [
        { "_id": "UnderReview", "count": 30 },
        { "_id": "Paused", "count": 10 },
        { "_id": "CertificateIssued", "count": 35 }
      ]
    },
    "certificates": {
      "total": 35,
      "emailSent": 35
    },
    "recentActivity": [ /* Recent applications */ ]
  }
}
```

---

### Get Audit Logs

**Endpoint:** `GET /admin/audit-logs`

**Access:** Private (SuperAdmin only)

**Query Parameters:**
- `page`, `limit`: Pagination
- `action`: Filter by action type
- `userId`: Filter by user
- `startDate`, `endDate`: Date range

---

## Response Formats

### Success Response
```json
{
  "status": "success",
  "message": "Optional message",
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ /* Optional validation errors */ ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Headers:**
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## File Upload Limits

- **Max File Size:** 5 MB
- **Allowed Types:**
  - PDF: `application/pdf`
  - Images: `image/jpeg`, `image/png`

---

**Last Updated:** February 2026
