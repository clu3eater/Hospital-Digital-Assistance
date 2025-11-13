# Hospital Digital Assistance System

A comprehensive web-based platform for managing hospital services, patient appointments, and healthcare connections.

## Features

### Patient Module
- User registration and secure login with JWT authentication
- Personal health profile with medical history and allergies tracking
- Hospital search with filters (location, specialty, facilities)
- Appointment booking, rescheduling, and cancellation
- Health records management
- Hospital ratings and reviews
- Appointment history and status tracking

### Hospital Module
- Hospital registration and admin login
- Hospital profile management with specialties and facilities
- Doctor management system
- Appointment confirmation and management
- Patient review monitoring
- Hospital dashboard with analytics
- Settings for hospital information

## Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: JWT tokens with localStorage
- **API**: Next.js Route Handlers
- **Hosting**: Vercel (recommended)

## Getting Started

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Patient: Register at `/patient/register` or login at `/patient/login`
   - Hospital: Register at `/hospital/register` or login at `/hospital/login`

## Project Structure

\`\`\`
app/
├── page.tsx                    # Home page
├── patient/
│   ├── register/              # Patient registration
│   ├── login/                 # Patient login
│   ├── dashboard/             # Patient dashboard
│   ├── profile/               # Patient profile & health info
│   ├── appointments/          # Appointments management
│   └── health-records/        # Health records
├── hospital/
│   ├── register/              # Hospital registration
│   ├── login/                 # Hospital login
│   ├── dashboard/             # Hospital admin dashboard
│   ├── settings/              # Hospital settings
│   ├── doctors/               # Doctor management
│   ├── reviews/               # Review management
│   └── [id]/
│       ├── page.tsx           # Hospital details
│       └── reviews/           # Hospital reviews
├── hospitals/                 # Hospital listing & search
├── appointments/[id]/
│   └── review/                # Appointment review form
└── api/
    ├── auth/                  # Authentication endpoints
    ├── patient/               # Patient APIs
    ├── hospital/              # Hospital APIs
    ├── appointments/          # Appointment APIs
    └── reviews/               # Review APIs
\`\`\`

## Features Roadmap

- MongoDB integration for data persistence
- Email/SMS notifications for appointments
- Payment integration for services
- Video consultation support
- Advanced analytics dashboard
- Mobile app development

## Environment Variables

For production deployment, configure:
- `DATABASE_URL` - MongoDB connection string (future)
- `JWT_SECRET` - JWT token secret
- `NEXT_PUBLIC_API_URL` - API endpoint URL

## Deployment

Deploy to Vercel:
\`\`\`bash
npm run build
vercel
\`\`\`

## License

MIT
