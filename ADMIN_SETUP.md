# Admin Panel Setup Guide

## Overview
The admin panel is now fully functional with hospital approval management.

## Features
✅ Admin login and authentication (hardcoded - no registration needed)
✅ Dashboard with statistics
✅ Hospital management with approve/reject
✅ Search and filter hospitals
✅ Real-time status updates

## Admin Login - No Setup Required!

The admin credentials are **hardcoded** in the system. No registration or database setup needed!

### Default Admin Credentials
```
Email:    admin@hdas.com
Password: admin@123
```

### How to Login
1. Go to `http://localhost:3000/admin/login`
2. Enter the credentials above
3. Click "Login"
4. You're in! 🎉

**⚠️ IMPORTANT: Change these credentials in production!**

### Changing Admin Credentials
Edit the file: `app/api/admin/login/route.ts`

Find and modify:
```typescript
const ADMIN_CREDENTIALS = {
  username: "admin",
  email: "admin@hdas.com",
  password: "admin@123", // Change this!
};
```

## Admin Panel URLs

### Development
- Admin Login: `http://localhost:3000/admin/login`
- Admin Dashboard: `http://localhost:3000/admin/dashboard`
- Hospital Management: `http://localhost:3000/admin/hospitals`

### Production
- Admin Login: `https://yourdomain.com/admin/login`
- Admin Dashboard: `https://yourdomain.com/admin/dashboard`
- Hospital Management: `https://yourdomain.com/admin/hospitals`

## Admin Panel Features

### 1. Dashboard (`/admin/dashboard`)
- **Statistics Cards:**
  - Total Hospitals
  - Verified Hospitals
  - Pending Approvals
  - Total Patients (placeholder)
- **Quick Actions:**
  - Manage Hospitals button
  - View Pending Approvals button
- **System Status:**
  - Online/Offline status
  - Database connection status
  - Pending actions count

### 2. Hospital Management (`/admin/hospitals`)
- **Search & Filter:**
  - Search by name, city, or email
  - Filter: All, Pending, Verified
- **Hospital Cards:**
  - Hospital details (name, email, phone, address)
  - Specialties tags
  - Registration date
  - Verification status badge
- **Actions:**
  - **Approve Button** (for pending hospitals)
    - Changes status to verified
    - Hospital becomes visible to patients
  - **Revoke Button** (for verified hospitals)
    - Changes status to unverified
    - Hospital hidden from patients

## API Endpoints Used

### Admin Authentication
- `POST /api/admin/register` - Create admin account
- `POST /api/admin/login` - Admin login

### Hospital Management
- `GET /api/hospital/all` - Get all hospitals (admin only)
  - Query params: `?status=verified|unverified|all`
- `PUT /api/hospital/approve` - Approve/reject hospital
  - Body: `{ hospitalId, isVerified }`

## Workflow

### Hospital Registration & Approval Flow
```
1. Hospital Registers
   ↓
2. Hospital Status: isVerified = false
   ↓
3. Hospital can login but NOT visible to patients
   ↓
4. Admin logs in to admin panel
   ↓
5. Admin views pending hospitals
   ↓
6. Admin clicks "Approve"
   ↓
7. Hospital Status: isVerified = true
   ↓
8. Hospital now visible to patients
   ↓
9. Hospital dashboard shows "Verified" badge
```

## Security Features
- JWT token authentication
- Role-based access (admin role required)
- Password hashing with bcrypt
- Protected API routes
- Token verification on all admin pages

## Testing the Admin Panel

### Step 1: Create Admin User
Use one of the methods above to create the first admin.

### Step 2: Login
1. Go to `http://localhost:3000/admin/login`
2. Enter credentials:
   - Email: `admin@hdas.com`
   - Password: `admin123`
3. Click "Login"

### Step 3: View Dashboard
- You'll be redirected to `/admin/dashboard`
- See statistics of hospitals

### Step 4: Manage Hospitals
1. Click "Manage Hospitals" or go to `/admin/hospitals`
2. See all registered hospitals
3. Filter by "Pending" to see unapproved hospitals
4. Click "Approve" to verify a hospital
5. Hospital will now appear in patient's hospital list

### Step 5: Test Patient View
1. Logout from admin
2. Login as a patient
3. Go to "Find Hospitals"
4. Only verified hospitals will be visible

## Troubleshooting

### Issue: Can't create admin user
**Solution:** Make sure MongoDB is connected and the Admin model is properly imported.

### Issue: Admin login fails
**Solution:** 
- Check if admin user exists in database
- Verify password is correct
- Check JWT_SECRET in environment variables

### Issue: Can't approve hospitals
**Solution:**
- Verify admin token is valid
- Check if hospital ID is correct
- Ensure API route has proper authentication

### Issue: Approved hospital not visible to patients
**Solution:**
- Check if `isVerified` field is set to `true`
- Verify `/api/hospital/list` is filtering correctly
- Clear browser cache and refresh

## Environment Variables
Make sure these are set in your `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

## Next Steps
1. ✅ Create first admin user
2. ✅ Login to admin panel
3. ✅ Approve pending hospitals
4. ⏳ Add email notifications (future enhancement)
5. ⏳ Add admin user management (future enhancement)
6. ⏳ Add audit logs (future enhancement)
