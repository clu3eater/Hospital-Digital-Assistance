# Hospital Approval System

## Overview
The Hospital Digital Assistance System now includes an approval mechanism where newly registered hospitals must be approved by an admin before becoming visible to patients.

## How It Works

### 1. Hospital Registration
When a hospital registers:
- Hospital account is created with `isVerified: false` (default)
- Hospital can log in and access their dashboard
- Hospital receives a message: "Your hospital has been registered. Please wait for admin approval before your hospital becomes visible to patients."

### 2. Pending Approval Status
While waiting for approval:
- ❌ Hospital is **NOT visible** in the patient's hospital list
- ✅ Hospital **CAN** log in to their dashboard
- ✅ Hospital **CAN** manage doctors, settings, etc.
- ⚠️ Dashboard shows a yellow banner: "Pending Approval - Your hospital is currently under review"

### 3. After Approval
Once admin approves the hospital:
- ✅ Hospital becomes **visible** to patients in the hospital list
- ✅ Patients can search, view, and book appointments
- ✅ Dashboard shows a green banner: "Hospital Verified - Your hospital is approved and visible to patients"

## Database Field
```typescript
isVerified: {
  type: Boolean,
  default: false, // New hospitals start as unverified
}
```

## API Endpoints

### For Patients (Public)
**GET `/api/hospital/list`**
- Returns only verified hospitals (`isVerified: true`)
- Used by patients to search and view hospitals
- Unverified hospitals are automatically filtered out

### For Admin (Protected)
**GET `/api/hospital/all?status=unverified`**
- Returns all hospitals (verified and unverified)
- Query params:
  - `status=verified` - Only verified hospitals
  - `status=unverified` - Only pending hospitals
  - `status=all` or no param - All hospitals
- Requires authentication token
- Returns stats: total, verified, unverified counts

**PUT `/api/hospital/approve`**
- Approves or unapproves a hospital
- Request body:
  ```json
  {
    "hospitalId": "hospital_id_here",
    "isVerified": true
  }
  ```
- Requires authentication token

## Implementation Details

### Hospital Model
```typescript
interface IHospital {
  hospitalName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  address: string;
  specialties: string[];
  isVerified: boolean; // ← Approval flag
  createdAt: Date;
  updatedAt: Date;
}
```

### Updated Files
1. ✅ `app/api/hospital/list/route.ts` - Only returns verified hospitals
2. ✅ `app/api/hospital/approve/route.ts` - New API to approve hospitals
3. ✅ `app/api/hospital/all/route.ts` - New API to get all hospitals (admin)
4. ✅ `app/hospital/register/page.tsx` - Shows approval message after registration
5. ✅ `app/hospital/dashboard/page.tsx` - Shows verification status banner
6. ✅ `app/hospitals/page.tsx` - Removed showAll parameter

## Admin Panel (To Be Implemented)
To complete the approval system, you'll need to create an admin panel with:

1. **Admin Login** - Separate admin authentication
2. **Hospital Management Page** - List all hospitals with approval status
3. **Approve/Reject Actions** - Buttons to approve or reject hospitals
4. **Filters** - View verified, unverified, or all hospitals

### Example Admin Panel Structure
```
app/admin/
├── login/page.tsx          # Admin login
├── dashboard/page.tsx      # Admin dashboard
└── hospitals/page.tsx      # Hospital approval management
```

### Example Admin Hospital Management
```typescript
// Approve hospital
const approveHospital = async (hospitalId: string) => {
  const response = await fetch("/api/hospital/approve", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      hospitalId,
      isVerified: true,
    }),
  });
};

// Fetch pending hospitals
const fetchPendingHospitals = async () => {
  const response = await fetch("/api/hospital/all?status=unverified", {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
};
```

## Security Notes
- Admin APIs require authentication token
- Consider adding role-based access control (RBAC)
- Add admin role to JWT token payload
- Validate admin role in API middleware

## Testing the System

### Test Flow:
1. Register a new hospital
2. Check that it doesn't appear in `/hospitals` page (patient view)
3. Log in as the hospital - see "Pending Approval" banner
4. Use admin API to approve the hospital
5. Refresh hospital dashboard - see "Hospital Verified" banner
6. Check `/hospitals` page - hospital now appears in the list

## Future Enhancements
- Email notifications when hospital is approved/rejected
- Rejection reasons and feedback
- Re-submission after rejection
- Automatic approval based on criteria
- Hospital verification documents upload
