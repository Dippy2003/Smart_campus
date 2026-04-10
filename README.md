# Smart Campus Management System

Full-stack campus platform for managing resources, bookings, incidents, notifications, and admin analytics.

## Tech Stack

- **Backend:** Spring Boot, Spring Security, Spring Data JPA, MySQL
- **Frontend:** React (CRA + `react-scripts`), React Router, Tailwind CSS
- **Auth:** Session-based login with optional Google OAuth2
- **Notifications:** In-app notification center + ticket-related updates

## Project Structure

- `backend/` — REST API, security, persistence, business logic
- `frontend/` — React application organized by feature modules
- `docs/` — IT3030-style full system documentation (Markdown + PDF generator; see `docs/IT3030_PAF_Smart_Campus_Full_Documentation.md`)

## Major Functional Modules

### 1) Member 1 — Resources

- Catalogue facilities/assets (rooms, labs, halls, equipment)
- Search and filter by type, status, location
- **Admin-only** create/update/delete (UI: `/admin/resources`); public browse at `/resources`
- Optional **booking calendar** flow: `/resources/calendar`

### 2) Member 2 — Bookings

- Create and manage bookings for resources
- Validation (time ranges, conflicts, availability)
- **Admin** approval/rejection; users can cancel/update pending bookings

### 3) Member 3 — Incidents / Tickets

- Create tickets with priority, category, location, attachments
- Status lifecycle: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`, `REJECTED`
- **Technician-only** staff console: list all tickets, update status, assign technician, replies, thread updates (`/incidents/admin`, resolved/cancelled views, detail pages)
- **Requesters** (including `USER` and `ADMIN` acting as requester): create ticket, “my” active/resolved/cancelled views
- Optional **assigned-ticket** view for technicians: `/incidents/technician`
- In-app notifications for requesters when tickets are updated (when configured)

### 4) Member 4 — Auth + Notifications

- Register / login / logout + session-based `AuthGuard` / `RoleGuard` on the frontend
- Roles: `USER`, `ADMIN`, `TECHNICIAN`
- Notification bell, notifications page, mark one or all as read

### Admin Dashboard and Analytics

- **`ADMIN`:** `/admin/dashboard` (resources, bookings, users, analytics — no ticket-management shortcuts on the dashboard)
- **`ADMIN`:** `/admin/analytics` (charts, trends; PDF export supported in UI)
- **`ADMIN`:** `/admin/users` user management (`/api/admin/...`)

## Roles — Who Can Access What (Summary)

| Area | USER | ADMIN | TECHNICIAN |
|------|------|-------|------------|
| Public resources / landing | Yes | Yes | Yes |
| Own bookings & incidents (requester flows) | Yes | Yes | No (redirected to ticket console) |
| `/admin/dashboard`, resources CRUD, bookings admin, users, analytics | No | Yes | No |
| Ticket management UI (`/incidents/admin` …) | No | No | Yes |
| Login default landing | `/` or `/dashboard` | `/admin/dashboard` | `/incidents/admin` |

Backend rules are enforced in `SecurityConfig.java` (e.g. staff incident APIs for **TECHNICIAN**, booking stats for **ADMIN**, resource mutations for **ADMIN**).

## Backend Overview

Packages under `backend/src/main/java/backend/`:

- `controller/` — `ResourceController`, `BookingController`, `IncidentTicketController`, `DashboardController`
- `service/` — `ResourceService`, `BookingService`, `IncidentTicketService`, `EmailNotificationService`
- `repository/` — JPA repositories for resources, bookings, incidents, notifications
- `auth/` — `SecurityConfig`, `AuthController`, `AdminUserController`, user provisioning, OAuth2
- `notification/` — `NotificationController`, `NotificationService`, user notification persistence

## Frontend Overview

Feature folders under `frontend/src/features/`:

- `member1-resources/`
- `member2-bookings/`
- `member3-incidents/`
- `member4-auth/`

Shared UI and services: `frontend/src/shared/`. **Routes:** `frontend/src/App.js`.

## Key API Areas

| Area | Base path |
|------|-----------|
| Resources | `/resources` |
| Bookings | `/api/bookings` |
| Incidents | `/api/incidents` |
| Notifications | `/api/notifications` |
| Dashboard stats | `/api/dashboard` |
| Admin users / signups | `/api/admin` |
| Auth | `/api/auth` |

## Authentication and Authorization

Configured in `backend/src/main/java/backend/auth/SecurityConfig.java`:

- **Public:** auth endpoints (`/api/auth/**`), OAuth2 login paths, **GET** resource listing/details
- **Authenticated:** bookings (per operation), `GET /api/incidents/my`, notification read on tickets, notifications API
- **`ADMIN`:** `/api/admin/**`, booking approve/reject, booking stats, resource POST/PUT/DELETE (match paths in `SecurityConfig` to your controller mappings)
- **`TECHNICIAN`:** staff incident operations (list all, get by id, status update, reply, technician listings)

Session is established on login; the React app uses `credentials: "include"` for cookie-based sessions.

## Incident Workflow (Current Behavior)

1. Requester submits a ticket from `/incidents/create` (not used as primary flow by `TECHNICIAN` accounts).
2. Ticket appears under the requester’s **My Tickets**.
3. A **technician** updates status, may set assignee and solution note, and can post replies.
4. Thread and notifications update for the requester where applicable.
5. Tickets appear under resolved/cancelled views based on status.

## Prerequisites

- Java 21
- Node.js 18+ and npm
- MySQL 8+
- Maven Wrapper: `backend/mvnw` (recommended) or local Maven

## Environment and Configuration

### Backend (`backend/src/main/resources/application.properties`)

- `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`
- Google OAuth (optional): `spring.security.oauth2.client.registration.google.client-id` and `client-secret`
- Optional: `spring.mail.*` for real email on ticket replies

### Frontend

- `REACT_APP_API_BASE_URL` — optional; if unset, dev typically uses the CRA proxy / relative `/api` behavior

## Running the Project

### 1) Backend

From `backend/`:

```bash
./mvnw spring-boot:run
```

Windows (PowerShell):

```powershell
.\mvnw.cmd spring-boot:run
```

Default: `http://localhost:8080`

### 2) Frontend

From `frontend/`:

```bash
npm install
npm start
```

Default: `http://localhost:3000`

## Default Route Map (Frontend)

**Public**

- `/` — landing (Smart Campus)
- `/login`, `/admin/login`
- `/resources`, `/resources/:id`, `/resources/calendar`

**Authenticated (typical `USER`)**

- `/dashboard`, `/notifications`
- `/bookings`, `/bookings/my`
- `/incidents` (create / my tickets / resolved / cancelled)

**`ADMIN`**

- `/admin/dashboard`, `/admin/analytics`
- `/admin/resources`, `/admin/resources/new`, `/admin/resources/:id/edit`
- `/admin/users`, `/admin/users/new`
- `/bookings/admin`

**`TECHNICIAN`**

- `/incidents/admin`, `/incidents/admin-resolved`, `/incidents/admin-cancelled`, `/incidents/admin/:id`
- `/incidents/technician`

**Guards**

- Wrong role → `/unauthorized`

## Demo accounts (from login UI hints)

- Admin: `admin@paf.com` / `Admin123`
- Technician: `tech@paf.com` / `Tech1234`
- Student: `student@paf.com` / `Student1A`

## Development Notes

- Hibernate DDL: `spring.jpa.hibernate.ddl-auto=update` (adjust for production).
- Do not commit secrets; use env-specific config for deployment.
- CORS allows `http://localhost:3000`.
- **Maintainability:** Keep `SecurityConfig` path patterns aligned with controller `@RequestMapping` values (e.g. `/resources` vs `/resource`).

## Future Improvements

- Docker Compose for app + MySQL
- More integration tests (bookings, incidents, security)
- CI (e.g. GitHub Actions) for build, test, lint
- OpenAPI/Swagger for the REST API
