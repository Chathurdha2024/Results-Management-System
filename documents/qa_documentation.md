# Quality Assurance & Testing Strategy
**Result Management System**

This document outlines the Quality Assurance (QA) strategies and methodologies applied to ensure the reliability, security, and performance of the Result Management System.

---

## 1. Security Testing

Security testing ensures the application is protected against malicious attacks, unauthorized access, and data breaches.

### Built-in Protections (Framework Level)
*   **SQL Injection (SQLi) Prevention:** The backend utilizes **Prisma ORM**. Prisma uses prepared statements and parameterized queries by default, meaning all user inputs are sanitized before reaching the PostgreSQL database. This completely mitigates traditional SQL injection attacks.
*   **Cross-Site Scripting (XSS) Prevention:** The frontend is built with **React**. React automatically escapes variables embedded in JSX before rendering them to the DOM, preventing malicious scripts from being executed in the users' browsers.

### API Security & Authentication Testing
*   **JWT Verification:** The system uses JSON Web Tokens (`@fastify/jwt`) for stateless authentication. QA involves testing API endpoints with expired tokens, malformed tokens, and missing tokens to ensure the system correctly rejects them with `401 Unauthorized`.
*   **Role-Based Access Control (RBAC):** Tests must verify that a logged-in Student cannot access Admin or Examiner endpoints (e.g., ensuring a student token cannot be used to POST to `/api/admin/batches`).

### Recommended Security Enhancements
To pass rigorous security QA, the following implementations are recommended:
1.  **Rate Limiting (`@fastify/rate-limit`):** To prevent Brute Force attacks on the `/api/auth/login` endpoints.
2.  **HTTP Headers (`@fastify/helmet`):** To set strict HTTP headers that prevent Clickjacking, sniffing, and other browser-side vulnerabilities.

---

## 2. API & Integration Testing

API testing verifies that the Fastify backend routes function correctly, interact with the database properly, and return the expected HTTP status codes and JSON payloads.

### Methodology
*   **Tools:** `Vitest` (Test Runner) + `Supertest` (HTTP Assertion Library).
*   **Process:** 
    1. Spin up a separate **Test Database**.
    2. Programmatically send HTTP requests (GET, POST, PUT, DELETE) to the endpoints.
    3. Assert the response status codes (e.g., `201 Created`, `400 Bad Request`).
    4. Assert the response body matches the expected schema.

### Key Integration Test Scenarios
*   **Batch Creation Flow:** Sending a POST request to `/api/admin/batches` and verifying that the response contains the plain-text passwords and that the database row count increased.
*   **CSV Upload Parsing:** Sending a multipart/form-data request with a mock CSV file to the results upload endpoint and verifying that the database correctly upserts the grades.

---

## 3. Unit Testing

Unit testing involves testing isolated pieces of business logic without connecting to the database or network. This ensures that the core mathematical or logical functions work flawlessly.

### Focus Areas
*   **GPA Calculation Engine:** Extract the SGPA and CGPA calculation logic from the Master Sheet route into a standalone utility function. 
*   **Test Case:** Pass a mock array of grades `['A+', 'B', 'C-']` and assert that the function returns the exact expected GPA float value.
*   **Registration Number Parsing:** Testing the regular expressions used to extract prefixes and generate student sequences (e.g., ensuring `EG/2020/001` to `EG/2020/005` correctly generates 5 string IDs).

---

## 4. End-to-End (E2E) UI Testing

E2E testing simulates real user interactions within a browser environment to ensure the frontend and backend work together seamlessly.

### Methodology
*   **Tools:** Cypress or Playwright.
*   **Process:** Automated scripts launch a headless browser, navigate to the React app, click buttons, fill out forms, and assert that the UI updates correctly.

### Critical E2E Workflows
1.  **Admin Login & Setup:** The automated browser logs in as an admin, navigates to Batch Management, creates a batch, and verifies the success toast notification appears.
2.  **Student Verification:** The automated browser logs in as a newly created student, verifies the "Change Password" prompt appears on first login, changes the password, and confirms the dashboard renders the correct modules.

---

## 5. Manual User Acceptance Testing (UAT) Checklist

Before any major release, a manual QA pass should be executed against the following matrix:

| Feature | Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **Authentication** | Login with invalid credentials | Shows "Invalid credentials" error | [ ] |
| **Batch Mgt** | Create a batch that already exists | Shows "Batch name already exists" | [ ] |
| **CSV Upload** | Upload CSV missing a 'Grade' column | Rejects upload with clear error message | [ ] |
| **Result Mgt** | Publish results for a module | Student dashboard immediately updates | [ ] |
| **Result Mgt** | Unpublish results | Results are hidden from student view | [ ] |
| **Performance** | Load Master Result Sheet | Renders within 2 seconds | [ ] |
