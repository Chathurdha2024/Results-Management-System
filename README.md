# Result Management System

A comprehensive Result Management System designed to handle student results, authentication, and administration across multiple platforms (Web and Mobile).

## Project Structure

This repository is a monorepo containing the following components:

- **`backend/`**: Node.js API built with Fastify, Prisma, and Neon (PostgreSQL).
- **`admin-frontend/`**: Web application for administrators to manage results, upload CSVs, and handle student records. Built with React 19, Vite, and Tailwind CSS v4.
- **`student-frontend/`**: Web application for students to view their results. Built with React 19, Vite, and Tailwind CSS v4.
- **`student-mobile/`**: Mobile application for students to view their results on the go. Built with React Native and Expo.
- **`docs/`**: Documentation and guides.

## Technology Stack

### Backend
- **Framework**: Fastify
- **Database**: PostgreSQL (via Neon Serverless)
- **ORM**: Prisma
- **Authentication**: JWT & bcrypt
- **File Handling**: fastify-multipart (for CSV uploads)
- **Real-time**: WebSockets

### Web Frontends (Admin & Student)
- **Library**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 & shadcn/ui
- **Routing**: React Router DOM
- **HTTP Client**: Axios

### Mobile Frontend
- **Framework**: React Native & Expo
- **Navigation**: React Navigation
- **Storage**: AsyncStorage

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Docker & Docker Compose (optional, for containerized setup)
- PostgreSQL database (or a Neon database connection string)

### Running with Docker Compose (Recommended for Web/Backend)

You can easily spin up the Backend, Admin Frontend, and Student Frontend using Docker Compose:

```bash
docker-compose up --build
```

- **Backend** will run on `http://localhost:3000`
- **Admin Frontend** will run on `http://localhost:5173`
- **Student Frontend** will run on `http://localhost:5174`

### Running Manually (Development Mode)

#### 1. Backend
Navigate to the `backend` directory, install dependencies, and run the server:
```bash
cd backend
npm install
# Set up your .env file with DATABASE_URL and JWT_SECRET
npm run dev
```

#### 2. Admin Frontend
Navigate to the `admin-frontend` directory:
```bash
cd admin-frontend
npm install
npm run dev
```

#### 3. Student Frontend
Navigate to the `student-frontend` directory:
```bash
cd student-frontend
npm install
npm run dev
```

#### 4. Student Mobile
Navigate to the `student-mobile` directory to start the Expo server:
```bash
cd student-mobile
npm install
npm start
```
You can then scan the QR code with the Expo Go app on your physical device, or run it on an iOS/Android emulator.

## Environment Variables

Make sure to configure the necessary environment variables in your respective folders (e.g., `backend/.env`). 

Example for `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@host/database"
JWT_SECRET="your_jwt_secret_key"
NODE_ENV="development"
```

## Features
- **Admin Dashboard**: Upload student credentials (via CSV), publish results, and manage records.
- **Student Portal (Web & Mobile)**: Secure login for students to view their academic results.
- **Real-time capabilities**: WebSockets integrated into the backend.
- **Modern UI**: Clean, responsive, and accessible UI built with base-ui and shadcn/ui.
