# Admin Login Credentials

## Default Admin Access

The admin panel uses hardcoded credentials for simplicity. No registration required!

### Login Details
```
Email:    admin@hdas.com
Password: admin@123
```

### Admin Panel URLs
- **Login:** `http://localhost:3000/admin/login`
- **Dashboard:** `http://localhost:3000/admin/dashboard`
- **Hospital Management:** `http://localhost:3000/admin/hospitals`

## How to Login

1. Go to the homepage: `http://localhost:3000`
2. Click the purple "Admin" button in the top right
3. Or directly visit: `http://localhost:3000/admin/login`
4. Enter the credentials:
   - Email: `admin@hdas.com`
   - Password: `admin@123`
5. Click "Login"
6. You'll be redirected to the admin dashboard

## Features Available

### Admin Dashboard
- View total hospitals count
- See verified vs unverified hospitals
- Quick access to hospital management
- System status indicators

### Hospital Management
- View all registered hospitals
- Search hospitals by name, city, or email
- Filter by status (All, Pending, Verified)
- **Approve** pending hospitals with one click
- **Revoke** verification from approved hospitals
- See hospital details (contact, address, specialties)

## Changing Admin Credentials

To change the admin credentials, edit the file:
`app/api/admin/login/route.ts`

Find this section:
```typescript
const ADMIN_CREDENTIALS = {
  username: "admin",
  email: "admin@hdas.com",
  password: "admin@123", // Change this password!
};
```

Change the email and password to your preferred values.

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**
1. Change the default password immediately
2. Use environment variables for credentials
3. Consider implementing proper admin user management
4. Add rate limiting to prevent brute force attacks
5. Use HTTPS in production

### Example with Environment Variables
```typescript
const ADMIN_CREDENTIALS = {
  username: "admin",
  email: process.env.ADMIN_EMAIL || "admin@hdas.com",
  password: process.env.ADMIN_PASSWORD || "admin@123",
};
```

Then add to your `.env` file:
```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

## Troubleshooting

### Can't login?
- Make sure you're using the exact credentials (case-sensitive)
- Check browser console for errors
- Clear browser cache and cookies
- Verify the API route is working: check Network tab

### Token expired?
- Tokens expire after 7 days
- Simply login again to get a new token

### Can't access admin pages?
- Make sure you're logged in
- Check if token is stored in localStorage
- Try logging out and logging in again

## Testing the System

1. **Login as Admin**
   - Use credentials above
   - Verify you can access dashboard

2. **Register a Test Hospital**
   - Go to hospital registration
   - Create a test hospital account
   - Hospital will be unverified by default

3. **Approve the Hospital**
   - Login to admin panel
   - Go to Hospital Management
   - Filter by "Pending"
   - Click "Approve" on the test hospital

4. **Verify Patient View**
   - Login as a patient
   - Go to "Find Hospitals"
   - The approved hospital should now be visible

5. **Test Revoke**
   - Go back to admin panel
   - Click "Revoke" on the approved hospital
   - Hospital should disappear from patient view

## Quick Reference

| Action | URL | Credentials |
|--------|-----|-------------|
| Admin Login | `/admin/login` | admin@hdas.com / admin@123 |
| Dashboard | `/admin/dashboard` | (after login) |
| Manage Hospitals | `/admin/hospitals` | (after login) |
| Approve Hospital | Click "Approve" button | One-click action |
| Revoke Hospital | Click "Revoke" button | One-click action |

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify MongoDB connection
3. Check if JWT_SECRET is set in environment
4. Ensure all dependencies are installed
5. Try restarting the development server
