# 👥 ROLES AND PERMISSIONS

## Complete Guide to All Roles in the No Dues Portal

---

## 📋 **ALL ROLES IN THE SYSTEM**

The No Dues Portal has **11 different roles**:

### **1. Student** 👨‍🎓
- **Purpose**: Submit and track No Dues applications
- **Department**: N/A (has branch instead)
- **Access Level**: Limited to own data

### **2. Faculty** 👨‍🏫
- **Purpose**: First approver in the workflow
- **Department**: ✅ Required (e.g., Computer Science)
- **Access Level**: Department-specific applications

### **3. ClassCoordinator** 📚
- **Purpose**: Second approver, coordinates class-level clearance
- **Department**: ✅ Required
- **Access Level**: Department-specific applications

### **4. HOD** 👔
- **Purpose**: Head of Department, third approver
- **Department**: ✅ Required
- **Access Level**: Department-specific applications

### **5. HostelWarden** 🏠
- **Purpose**: Approves hostel clearance (if student stayed in hostel)
- **Department**: ❌ Not required
- **Access Level**: All applications (only if hostel involved)

### **6. LibraryAdmin** 📖
- **Purpose**: Clears library dues and book returns
- **Department**: ❌ Not required
- **Access Level**: All applications

### **7. WorkshopAdmin** 🔧
- **Purpose**: Clears workshop/lab equipment and dues
- **Department**: ❌ Not required
- **Access Level**: All applications

### **8. TPOfficer** 💼
- **Purpose**: Training & Placement clearance, exit survey
- **Department**: ❌ Not required
- **Access Level**: All applications

### **9. GeneralOffice** 🏢
- **Purpose**: Issues Transfer Certificate (TC)
- **Department**: ❌ Not required
- **Access Level**: All applications

### **10. AccountsOfficer** 💰
- **Purpose**: Final approver, clears all financial dues
- **Department**: ❌ Not required
- **Access Level**: All applications

### **11. SuperAdmin** 🔐
- **Purpose**: System administrator, manages users and system
- **Department**: ❌ Not required
- **Access Level**: Full system access

---

## 🔄 **APPROVAL WORKFLOW ORDER**

Applications flow through these stages in order:

```
1. Student Submits Application
        ↓
2. Faculty (Department-specific)
        ↓
3. Class Coordinator (Department-specific)
        ↓
4. HOD (Department-specific)
        ↓
5. Hostel Warden (Only if hostel involved)
        ↓
6. Library Admin
        ↓
7. Workshop Admin
        ↓
8. T&P Officer
        ↓
9. General Office
        ↓
10. Accounts Officer (Final - Generates Certificate)
```

---

## 🏢 **DEPARTMENT-BASED ROLES**

### **Roles That Filter by Department**:
- **Faculty**
- **ClassCoordinator**
- **HOD**

These roles only see applications from students in their department.

**Example**:
- Computer Science Faculty → Only sees CS students
- Electronics HOD → Only sees ECE students

### **Roles That See All Applications**:
- **HostelWarden**
- **LibraryAdmin**
- **WorkshopAdmin**
- **TPOfficer**
- **GeneralOffice**
- **AccountsOfficer**

These are shared resources that serve all departments.

---

## 📊 **ROLE PERMISSIONS**

### **Student Permissions**:
```javascript
✅ Create/Update own profile
✅ Submit No Dues application
✅ Upload documents
✅ View own application status
✅ Resubmit paused application
✅ Download certificate (when issued)
❌ Cannot view other students' data
❌ Cannot approve applications
```

### **Approver Permissions** (Faculty, Coordinator, HOD, etc.):
```javascript
✅ View pending applications (filtered by role/department)
✅ View application details
✅ Approve applications
✅ Pause applications with remarks
✅ View approval history
❌ Cannot modify applications
❌ Cannot delete applications
❌ Cannot skip workflow stages
```

### **SuperAdmin Permissions**:
```javascript
✅ Create/Update/Delete users
✅ View all applications
✅ View system statistics
✅ View audit logs
✅ Manage workflow configuration
✅ Regenerate certificates
✅ Full system access
❌ Cannot approve applications (not in workflow)
```

---

## 🔑 **TEST ACCOUNTS**

All accounts use password: `password123`

### **Student**:
```
Email: student@mitsgwl.ac.in
Role: Student
Branch: Computer Science
```

### **Department-Specific Approvers**:
```
Faculty:
  Email: faculty@mitsgwl.ac.in
  Role: Faculty
  Department: Computer Science

Class Coordinator:
  Email: coordinator@mitsgwl.ac.in
  Role: ClassCoordinator
  Department: Computer Science

HOD:
  Email: hod@mitsgwl.ac.in
  Role: HOD
  Department: Computer Science
```

### **Shared Resource Approvers**:
```
Library Admin:
  Email: library@mitsgwl.ac.in
  Role: LibraryAdmin

Workshop Admin:
  Email: workshop@mitsgwl.ac.in
  Role: WorkshopAdmin

T&P Officer:
  Email: tp@mitsgwl.ac.in
  Role: TPOfficer

General Office:
  Email: general@mitsgwl.ac.in
  Role: GeneralOffice

Accounts Officer:
  Email: accounts@mitsgwl.ac.in
  Role: AccountsOfficer
```

### **Administrator**:
```
Super Admin:
  Email: admin@mitsgwl.ac.in
  Role: SuperAdmin
```

---

## 🎯 **ROLE-SPECIFIC FEATURES**

### **Student Features**:
1. **Profile Management**
   - Update enrollment number
   - Update father's name
   - Update address
   - Update phone number

2. **Application Submission**
   - Fill multi-step form
   - Upload 4 required documents
   - Declare prerequisites completed
   - Accept terms and conditions

3. **Status Tracking**
   - View current stage
   - See approval progress
   - View remarks (if paused)
   - Track timeline

4. **Certificate Download**
   - Download PDF certificate
   - View certificate details
   - Check email status

### **Approver Features**:
1. **Pending Applications**
   - View list of pending applications
   - Filter by date/status
   - Search by enrollment number
   - Pagination support

2. **Application Review**
   - View student details
   - View uploaded documents
   - View previous approvals
   - View application timeline

3. **Approval Actions**
   - Approve application
   - Pause with remarks
   - Add office-specific data:
     - Library: Library dues amount
     - General Office: TC number and date

4. **History**
   - View approved applications
   - View paused applications
   - Filter by date range

### **SuperAdmin Features**:
1. **User Management**
   - Create new users
   - Update user details
   - Activate/Deactivate users
   - Assign roles and departments

2. **Application Oversight**
   - View all applications
   - View application statistics
   - Monitor workflow progress

3. **System Management**
   - View audit logs
   - Configure workflow
   - Regenerate certificates
   - System statistics

---

## 🔒 **SECURITY & ACCESS CONTROL**

### **Authentication**:
- JWT-based authentication
- Access token (15 minutes)
- Refresh token (7 days)
- Automatic token refresh

### **Authorization**:
- Role-based access control (RBAC)
- Route-level protection
- Department-based filtering
- Resource ownership validation

### **Data Protection**:
- Password hashing (bcrypt)
- Secure file uploads
- Input validation (Zod)
- XSS protection
- CORS configuration

---

## 📝 **ROLE DEFINITIONS IN CODE**

### **User Model** (`models/User.js`):
```javascript
role: {
  type: String,
  enum: [
    'Student',
    'Faculty',
    'ClassCoordinator',
    'HOD',
    'HostelWarden',
    'LibraryAdmin',
    'WorkshopAdmin',
    'TPOfficer',
    'GeneralOffice',
    'AccountsOfficer',
    'SuperAdmin'
  ],
  required: true
}
```

### **Workflow Configuration** (`config/workflow.js`):
```javascript
const APPROVAL_WORKFLOW = [
  { stage: 'Faculty', order: 1, required: true },
  { stage: 'ClassCoordinator', order: 2, required: true },
  { stage: 'HOD', order: 3, required: true },
  { stage: 'HostelWarden', order: 4, required: false, condition: 'hostelInvolved' },
  { stage: 'LibraryAdmin', order: 5, required: true },
  { stage: 'WorkshopAdmin', order: 6, required: true },
  { stage: 'TPOfficer', order: 7, required: true },
  { stage: 'GeneralOffice', order: 8, required: true },
  { stage: 'AccountsOfficer', order: 9, required: true }
];
```

---

## 🎓 **DEPARTMENT LIST**

Valid department names (must match exactly):

1. **Computer Science**
2. **Electronics**
3. **Mechanical**
4. **Civil**
5. **Electrical**
6. **Information Technology**

---

## 🔄 **ROLE TRANSITIONS**

### **What Happens at Each Stage**:

**Stage 1 - Faculty**:
- Reviews student's academic standing
- Verifies department-specific requirements
- Approves or pauses with remarks

**Stage 2 - Class Coordinator**:
- Verifies class-level clearances
- Checks attendance and conduct
- Approves or pauses

**Stage 3 - HOD**:
- Final department-level approval
- Reviews overall academic record
- Approves or pauses

**Stage 4 - Hostel Warden** (if applicable):
- Verifies room clearance
- Checks hostel dues
- Confirms no damages

**Stage 5 - Library Admin**:
- Checks book returns
- Verifies library dues cleared
- Records library dues amount

**Stage 6 - Workshop Admin**:
- Verifies equipment returns
- Checks lab dues
- Confirms no pending items

**Stage 7 - T&P Officer**:
- Verifies exit survey completed
- Checks placement records
- Confirms T&P clearance

**Stage 8 - General Office**:
- Issues Transfer Certificate
- Records TC number and date
- Verifies general office clearance

**Stage 9 - Accounts Officer** (Final):
- Verifies all financial dues cleared
- Final approval
- **Triggers certificate generation**
- **Sends certificate via email**

---

## 📧 **EMAIL NOTIFICATIONS**

### **Student Receives Emails For**:
- ✅ Application submitted
- ✅ Application paused (with remarks)
- ✅ Application approved (at each stage)
- ✅ Certificate issued (with PDF attachment)

### **Approvers Receive Emails For**:
- ✅ New application pending (optional)
- ✅ Application resubmitted after pause

---

## 🎊 **SUMMARY**

| Role | Count | Department Required | Sees All Apps | Can Approve |
|------|-------|---------------------|---------------|-------------|
| Student | Many | No (has branch) | No | No |
| Faculty | Many | ✅ Yes | No | Yes |
| ClassCoordinator | Many | ✅ Yes | No | Yes |
| HOD | Many | ✅ Yes | No | Yes |
| HostelWarden | 1+ | No | Yes* | Yes |
| LibraryAdmin | 1+ | No | Yes | Yes |
| WorkshopAdmin | 1+ | No | Yes | Yes |
| TPOfficer | 1+ | No | Yes | Yes |
| GeneralOffice | 1+ | No | Yes | Yes |
| AccountsOfficer | 1+ | No | Yes | Yes |
| SuperAdmin | 1+ | No | Yes | No** |

*Only sees applications where hostel is involved  
**SuperAdmin manages system but doesn't approve applications

---

## 📚 **RELATED DOCUMENTATION**

- `DEPARTMENT_FILTERING.md` - Department-based filtering details
- `APPROVAL_WORKFLOW_GUIDE.md` - Complete workflow guide
- `BACKEND_COMPLETION_REPORT.md` - Backend features
- `PROJECT_100_PERCENT_COMPLETE.md` - Project overview

---

**Created**: February 11, 2026, 23:03 IST  
**Total Roles**: 11  
**Department-Specific**: 3 (Faculty, ClassCoordinator, HOD)  
**Shared Resources**: 6 (Hostel, Library, Workshop, T&P, General, Accounts)  
**Administrative**: 2 (Student, SuperAdmin)

---

## 🚀 **QUICK REFERENCE**

**To create a new user with a specific role**:
```javascript
const user = await User.create({
  name: "User Name",
  email: "email@mitsgwl.ac.in",
  passwordHash: hashedPassword,
  role: "Faculty", // Choose from 11 roles
  department: "Computer Science", // Required for Faculty/Coordinator/HOD
  isActive: true
});
```

**To check user's role in code**:
```javascript
if (req.user.role === 'Faculty') {
  // Faculty-specific logic
}
```

**To authorize specific roles**:
```javascript
router.get('/route', authenticate, authorize('Faculty', 'HOD'), controller);
```

---

**All 11 roles are fully implemented and working!** ✅
