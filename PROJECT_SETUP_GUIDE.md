# 🏥 Hospital Digital Assistance System - Setup & Requirements

This guide provides all the necessary information to get the project up and running on your local machine. Follow these steps to set up the development environment.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: `v18.0.0` or higher (Recommended: `v20+`)
*   **npm**: `v9.0.0` or higher
*   **MongoDB**: A running MongoDB instance (Local community server or MongoDB Atlas Cluster)
*   **Git**: For cloning the repository

---

## 📦 Project Requirements

The system is built using modern web technologies. Key dependencies include:

### Core Framework
| Package | Version | Description |
| :--- | :--- | :--- |
| **Next.js** | `15.0.0` | React Framework for Production |
| **React** | `18.3.1` | UI Library |
| **Mongoose** | `8.19.3` | MongoDB Object Modeling |
| **TypeScript** | `^5` | Static Typing |

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Reusable UI components built with Radix UI.
- **Lucide React**: Beautiful & consistent iconography.
- **Framer Motion**: (Optional/Included via shadcn) for smooth animations.

### Backend & Security
- **Bcryptjs**: Password hashing for secure authentication.
- **JSONWebToken (JWT)**: Secure token-based authentication.
- **Zod**: TypeScript-first schema validation.

---

## 🚀 Installation Steps

Follow these instructions to set up the project:

### 1. Clone the Repository
```bash
git clone https://github.com/clu3eater/Hospital-Digital-Assistance.git
cd "Hospital Digital Assistance system"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following configurations. You can use `.env.example` as a reference.

```env
# MongoDB Connection String (Replace with your own)
DB_URL=mongodb://localhost:27017/HDAS

# Secret key for JWT signing (Use a random long string)
JWT_SECRET=your_secret_key_here

# Frontend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Run the Application

#### Development Mode
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

#### Production Build
```bash
npm run build
npm start
```

---

## 📂 Project Structure Overview

Understanding the directory layout:

- `/app`: Contains all pages and API routes (Next.js App Router).
- `/components`: Shared React components (UI, Forms, Layouts).
- `/lib`: Core logic, including Database connection (`db.ts`) and Mongoose Models (`models/`).
- `/public`: Static assets like images and icons.
- `/hooks`: Custom React hooks for state and data fetching.

---

## 💡 Troubleshooting

- **MongoDB Connection Error**: Ensure your MongoDB service is running and the `DB_URL` in `.env` is correct.
- **Module Not Found**: If you encounter dependency issues, try deleting `node_modules` and `package-lock.json`, then run `npm install` again.
- **Environment Variables**: If the API calls fail, double-check that `NEXT_PUBLIC_API_URL` points to the correct port (default is 3000).

---

## 📄 License
This project is licensed under the **MIT License**.
