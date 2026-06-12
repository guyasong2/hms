# Hospital Management System (HMS)

A secure, scalable, and professional Hospital Management System built to facilitate seamless patient-doctor interactions, appointment booking, and clinic management.

## 🌟 Overview

The HMS is a full-stack web application designed to bridge the gap between healthcare professionals and patients. It features a modern, clean UI, a secure booking workflow, and integrated Mobile Money payments. The platform supports distinct roles for Patients, Doctors, and Administrators, providing customized dashboards and functionalities for each user type.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 (bootstrapped with Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with responsive, modern UI design)
- **Routing:** React Router v6
- **State Management & Data Fetching:** React Query (@tanstack/react-query), Context API
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Security:** Helmet, Express Rate Limit, CORS, bcrypt, jsonwebtoken
- **Validation:** Zod

### Database & Cloud Services
- **Database:** Supabase (PostgreSQL)
- **Client:** `@supabase/supabase-js`
- **Schema Management:** Raw SQL schema (`schema.sql`) and Supabase Dashboard

## ✨ Key Features

### Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (RBAC) with three main roles: **Patient**, **Doctor**, and **Admin**.
- Automated profile creation upon registration for respective roles.

### Patient Portal
- **Browse Doctors:** View a directory of available doctors with detailed profiles and specialties.
- **Appointment Booking:** Seamlessly book appointments with preferred doctors for specific time slots.
- **Payment Integration:** Integrated Mobile Money payment flows (MTN/Orange) for booking fees.
- **Patient Dashboard:** Manage upcoming appointments, view medical history, and handle profile settings.

### Doctor Portal
- **Doctor Dashboard:** View upcoming and pending appointments.
- **Schedule Management:** Accept, decline, or complete patient appointments.
- **Profile Management:** Update specialty, consultation fees, and professional details.

### Admin Portal
- **System Overview:** Monitor total appointments, revenue, and active users.
- **User Management:** Oversee patient and doctor accounts.
- **Platform Management:** Approve doctor registrations and manage platform settings.

## 📂 Project Structure

The project is structured as a monorepo with distinct `frontend` and `backend` directories.

```
Hms/
├── backend/                  # Node.js / Express Backend
│   ├── src/
│   │   ├── config/           # Configuration files (Supabase, Env)
│   │   ├── controllers/      # Route controllers (Auth, Doctors, Appointments, etc.)
│   │   ├── middleware/       # Custom Express middleware (Auth, Error handling)
│   │   ├── routes/           # Express API routes
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Business logic & Supabase interactions
│   │   ├── utils/            # Helper functions
│   │   └── index.ts          # Server entry point
│   ├── schema.sql            # Database schema definitions
│   └── package.json
│
├── frontend/                 # React / Vite Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (e.g., AuthContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries and API clients (Axios)
│   │   ├── pages/            # Page components (Dashboards, Booking, Login, etc.)
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # React entry point
│   ├── tailwind.config.js
│   └── package.json
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase Account and Project

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ```
4. Setup the database schema in Supabase using the provided `schema.sql`.
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `frontend` directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints Summary

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Doctors:** `/api/doctors`, `/api/doctors/:id`
- **Appointments:** `/api/appointments`, `/api/appointments/:id/status`
- **Payments:** `/api/payments/initiate`, `/api/payments/verify`
- **Admin:** `/api/admin/stats`

## 🛡️ Security & Best Practices
- Passwords are securely hashed using `bcrypt` before storing in Supabase.
- Authentication uses HTTP-only cookies or Bearer tokens.
- Inputs are validated on both the client and server sides (via Zod).
- Sensitive Supabase operations use the Service Role key exclusively on the backend.
