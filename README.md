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

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: A running instance (Local or MongoDB Atlas)

### Quick Setup

#### Windows
Double-click `setup.bat` or run:
```powershell
.\setup.bat
```

#### Linux / macOS
Run the following commands:
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/clu3eater/Hospital-Digital-Assistance.git
   cd "Hospital Digital Assistance system"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and update it with your credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and provide your `DB_URL` (MongoDB connection string).

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration

The system uses the following environment variables. Ensure they are set in your `.env` file:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DB_URL` | MongoDB Connection String | `mongodb://localhost:27017/HDAS` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `NEXT_PUBLIC_API_URL` | Frontend API Base URL | `http://localhost:3000/api` |

---

## 🛠️ Project Structure

```text
app/
├── api/                # Next.js Route Handlers (Backend)
├── patient/            # Patient-facing pages
├── hospital/           # Hospital-facing pages
└── hospitals/          # Public hospital listings
components/             # Shared UI components (Radix UI + Tailwind)
lib/
├── models/             # Mongoose schemas (Patient, Hospital, Doctor, etc.)
├── db.ts               # Database connection logic
└── utils.ts            # Utility functions
public/                 # Static assets
```

---

## 📈 Roadmap

- [ ] Email/SMS notifications for appointments
- [ ] Stripe/Razorpay payment gateway integration
- [ ] Real-time video consultation via WebRTC
- [ ] PWA support for mobile devices
- [ ] Multi-language support (i18n)

## Deployment

Deploy to Vercel:
```bash
npm run build
vercel
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
