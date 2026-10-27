# FlatFlow — Product Requirements Document (PRD) & Execution Log

**Domain:** Housing Society Maintenance Management & Payments  
**Target:** Single Housing Society  
**Submission Deadline:** 27 October 2026, 9:00 PM IST  
**Stack:** MongoDB, Express.js, React.js, Node.js (MERN)

---

## 1. Project Status Summary

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Project Scaffolding & Foundation | **Completed** |
| **Phase 2** | Authentication & Role-Based Authorization | **In Progress** |
| **Phase 3** | Flat Management & Maintenance Billing | Planned |
| **Phase 4** | Payment Gateway Integration (Razorpay Test Mode) & Receipts | Planned |
| **Phase 5** | Billing Disputes, Private Uploads & In-App Notifications | Planned |
| **Phase 6** | Society Financial Analytics & Deployment Prep | Planned |

---

## 2. Feature Tracking Matrix

| Feature | Category | State | Notes |
|---|---|---|---|
| Environment Verification | Foundation | **Completed** | Node v24.12.0, npm 11.6.2, Git 2.51.0 confirmed |
| Git Setup & Safe `.gitignore` | Foundation | **Completed** | Repository connected to GitHub (`main`) |
| Backend Scaffolding (`server/`) | Foundation | **Completed** | Express, CORS, cookie-parser, error middleware, health route |
| Frontend Scaffolding (`client/`) | Foundation | **Completed** | React + Vite, react-router-dom, Axios with credentials |
| MongoDB Atlas Connection | Database | **Completed** | Live connection verified with Atlas cluster |
| User & Flat Data Models | Auth & Data | **In Progress** | Role enforcement: `resident` and `admin` |
| JWT Authentication in HttpOnly Cookie | Security | Planned | Login, logout, session check |
| Bill Generation & Uniqueness Guard | Billing | Planned | Prevent duplicate periods per flat |
| Resident My-Bills & Search/Filters | Billing | Planned | Status: Unpaid, Overdue, Paid |
| Razorpay Test Mode Order & Verification | Payments | Planned | Server-side signature validation |
| Payment Receipts & History | Payments | Planned | Tamper-proof verified payment records |
| Dispute Lifecycle & Document Evidence | Disputes | Planned | Open -> Under Review -> Resolved |
| In-App Notifications | Notifications | Planned | Due-date and bill alerts |
| Admin Dashboard Analytics | Reporting | Planned | Verified collections vs pending vs overdue |

*States: Planned | In Progress | Implemented | Tested | Deployed*

---

## 3. Git Commit Log

| # | Commit Message | Description |
|---|---|---|
| 1 | `chore: initial project repository and PRD setup` | Initialized git, added strict `.gitignore`, created living PRD |
| 2 | `feat: scaffold Express backend with modular architecture and health check` | Setup Express server, ES modules, error handlers, and config |
| 3 | `feat: scaffold React frontend with Vite, Axios client, and health check integration` | Setup React + Vite, Axios with credentials, basic responsive layout |
