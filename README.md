<div align="center">
  
# 🎓 Ruhuna EngRMS 
**Results Management System for the Faculty of Engineering, University of Ruhuna**

[![Node.js CI](https://github.com/Chathurdha2024/Results-Management-System/actions/workflows/ci.yml/badge.svg)](https://github.com/Chathurdha2024/Results-Management-System/actions/workflows/ci.yml)
[![Deployment](https://img.shields.io/badge/Deployment-Jenkins%20%7C%20AWS-blue?logo=jenkins&logoColor=white)](#deployment-architecture-cicd)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](#running-with-docker-compose-recommended-for-webbackend)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](#web-frontends-admin--student)
[![Fastify](https://img.shields.io/badge/Fastify-5.0-000000?logo=fastify&logoColor=white)](#backend)

*A comprehensive Result Management System designed to handle student results, authentication, and administration across multiple platforms (Web and Mobile) seamlessly.*

</div>

<br/>

## 📁 Project Structure

This repository is a structured monorepo containing the following core services:

- 🗄️ **`backend/`**: High-performance Node.js REST API built with Fastify, Prisma ORM, and Neon Serverless PostgreSQL.
- 👨‍🏫 **`admin-frontend/`**: Web portal for administrators/examiners to manage results, upload grading CSVs, and handle student records. Built with React 19, Vite, and Tailwind CSS v4.
- 👨‍🎓 **`student-frontend/`**: Dedicated web portal for students to securely view their academic results and GPA. Built with React 19, Vite, and Tailwind CSS v4.
- 📱 **`student-mobile/`**: Cross-platform mobile application for students to view their results on the go. Built with React Native and Expo.
- 📚 **`docs/`**: Detailed project documentation and deployment guides.

---

## 🛠️ Technology Stack

### ⚙️ Backend
- **Framework**: Fastify (Extremely fast Node.js web framework)
- **Database**: PostgreSQL (Hosted via Neon Serverless)
- **ORM**: Prisma Client
- **Authentication**: JWT (JSON Web Tokens) & bcrypt password hashing
- **File Handling**: fastify-multipart (For robust CSV parsing and uploads)
- **Real-time**: WebSockets

### 💻 Web Frontends (Admin & Student)
- **Library**: React 19
- **Build Tool**: Vite (Lightning-fast HMR)
- **Styling**: Tailwind CSS v4 & shadcn/ui
- **Routing**: React Router DOM
- **HTTP Client**: Axios

### 📱 Mobile Frontend
- **Framework**: React Native & Expo
- **Navigation**: React Navigation
- **Storage**: AsyncStorage

---

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- Docker & Docker Compose (optional, but recommended for simple setup)
- PostgreSQL database (or a Neon DB connection string)

### 🐳 Running with Docker Compose (Recommended)

You can spin up the entire infrastructure (Backend, Admin Frontend, and Student Frontend) instantly using Docker:

```bash
docker-compose up --build -d
```

- **Backend API:** `http://localhost:3000`
- **Admin Portal:** `http://localhost:5173`
- **Student Portal:** `http://localhost:5174`

### 🔧 Running Manually (Development Mode)

If you prefer to run the services individually for development:

<details>
<summary><b>1. Backend Setup</b></summary>
Navigate to the `backend` directory, install dependencies, configure environment variables, and start the development server:

```bash
cd backend
npm install
# Ensure .env is configured with DATABASE_URL and JWT_SECRET
npm run dev
```
</details>

<details>
<summary><b>2. Admin Frontend Setup</b></summary>
Navigate to the `admin-frontend` directory:

```bash
cd admin-frontend
npm install
npm run dev
```
</details>

<details>
<summary><b>3. Student Frontend Setup</b></summary>
Navigate to the `student-frontend` directory:

```bash
cd student-frontend
npm install
npm run dev
```
</details>

<details>
<summary><b>4. Student Mobile App</b></summary>
Navigate to the `student-mobile` directory to start the Expo server:

```bash
cd student-mobile
npm install
npm start
```
*Scan the generated QR code with the Expo Go app on your physical device, or press `i`/`a` to run it on an iOS/Android emulator.*
</details>

---

## 🔐 Environment Variables

Ensure your environment variables are correctly configured in your respective folders (e.g., `backend/.env`). 

Example `.env` structure for the backend:
```env
DATABASE_URL="postgresql://user:password@host/database"
JWT_SECRET="your_highly_secure_jwt_secret_key"
NODE_ENV="development"
```

---

## ☁️ Deployment Architecture (CI/CD)

This application is deployed live to an **AWS EC2 Instance** with a fully automated, professional CI/CD pipeline:

- 🧪 **Continuous Integration (CI):** Backend test suites are automatically executed by **GitHub Actions** on every push to ensure code stability.
- 🚀 **Continuous Deployment (CD):** Live server deployment is handled by **Jenkins**. A GitHub Webhook instantly triggers Jenkins to pull the latest code and rebuild changed containers dynamically using Docker Compose for near zero-downtime deployments.

🔗 **For full architectural details, network configurations, and the complete CI/CD Mermaid flowchart, please read the full [Deployment Documentation](documents/DEPLOYMENT.md).**

---

## 🛡️ Security & Authentication (Backend)

The backend acts as an impenetrable fortress using enterprise-grade security standards:

- 🔑 **Token Generation (JWT & bcrypt):** The backend securely hashes passwords using `bcrypt`. Upon successful login, the backend generates and cryptographically signs a secure JSON Web Token (JWT) using a secret key.
- 🚧 **Protected Routes (The Security Guard):** The frontend only stores the token, but the backend acts as the true security guard. Every time the frontend requests data (like "give me the student results"), the backend intercepts the request, verifies the JWT signature, and instantly blocks malicious requests with a `401 Unauthorized` error if the token is fake, tampered with, or expired.
- 👮‍♂️ **Role-Based Access Control (RBAC):** The backend inspects the payload of every verified token to determine if the user is a `STUDENT`, `ADMIN`, or `EXAMINER`, strictly restricting their database access based on their exact role.

For an in-depth code explanation, read the full [Security Documentation](documents/SECURITY.md).

---

## ✨ Key Features
- **Admin Dashboard**: Effortlessly upload student credentials (via CSV), publish verified results, and manage departmental records.
- **Student Portal (Web & Mobile)**: Secure login for students to view their real-time academic results and GPA breakdowns.
- **Real-time Capabilities**: WebSockets integrated into the backend for instant notifications.
- **Modern UI/UX**: Clean, responsive, and accessible interfaces built with base-ui and shadcn/ui.

---
<div align="center">
  <i>Developed for the Faculty of Engineering, University of Ruhuna</i>
</div>
