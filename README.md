# Smart Campus Management System

Full-stack campus platform for managing resources, bookings, incidents, notifications, and admin analytics.

## Tech Stack

- Backend: Spring Boot, Spring Security, Spring Data JPA, MySQL
- Frontend: React (CRA + `react-scripts`), React Router, Tailwind CSS
- Auth: Session-based login with optional Google OAuth2
- Notifications: In-app notification center + ticket notification feed

## Project Structure

- `backend/` - REST API, security, persistence, business logic
- `frontend/` - React application organized by feature modules

## Major Functional Modules

### 1) Member 1 - Resources

- Manage facilities/assets (rooms, labs, halls, equipment)
- Search and filter by type, status, location
- Admin/technician resource CRUD

### 2) Member 2 - Bookings

- Create and manage bookings for resources
- Booking validation (time ranges, conflicts, availability)
- Admin approval/rejection and cancellation flow

### 3) Member 3 - Incidents / Tickets

- Create incident tickets with priority, category, location, attachments
- Ticket status lifecycle (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`, `REJECTED`)
- Admin replies, technician assignment, timeline updates
- Separate active/resolved/cancelled views for requester and admin

### 4) Member 4 - Auth + Notifications

- Register/login/logout + session-based auth guards
- Role-based route protection (`USER`, `ADMIN`, `TECHNICIAN`)
- Notification bell, full notifications page, mark one/all as read
- Notification feed merges booking-related and incident-related updates

### Admin Dashboard and Analytics

- Summary stats and detailed breakdowns
- Resource and booking trends
- Incident volume and operational visibility

## Backend Overview

Main backend packages under `backend/src/main/java/backend/`:

- `controller/`
  - `ResourceController`
  - `BookingController`
  - `IncidentTicketController`
  - `DashboardController`
- `service/`
  - `ResourceService`
  - `BookingService`
  - `IncidentTicketService`
  - `EmailNotificationService`
- `repository/`
  - `ResourceRepository`
  - `BookingRepository`
  - `IncidentTicketRepository`
  - `TicketNotificationRepository`
- `auth/`
  - `SecurityConfig`
  - Auth controllers/services/repositories
- `notification/`
  - `NotificationController`
  - `NotificationService`
  - `UserNotificationRepository`

## Frontend Overview

Main frontend feature folders under `frontend/src/features/`:

- `member1-resources/`
- `member2-bookings/`
- `member3-incidents/`
- `member4-auth/`

Shared pages/components/services in `frontend/src/shared/`.
Application routes are defined in `frontend/src/App.js`.

## Key API Areas

- Resources: `/resources`
- Bookings: `/api/bookings`
- Incidents: `/api/incidents`
- Notifications: `/api/notifications`
- Dashboard: `/api/dashboard`
- Auth: `/api/auth`

## Authentication and Authorization

Backend security is configured in `backend/src/main/java/backend/auth/SecurityConfig.java`:

- Public: login/auth endpoints, public resource listing/details
- Authenticated: user bookings, own tickets, notifications
- Role-restricted:
  - `ADMIN`: admin users/analytics, booking approve/reject
  - `TECHNICIAN`: technician/admin incident management routes

## Incident Workflow (Current Behavior)

1. User submits ticket from `/incidents/create`.
2. Ticket appears under requester active tickets.
3. Admin/technician updates status and can assign technician + solution note.
4. Status/reply updates are added to ticket thread.
5. In-app notifications are created for requester updates.
6. Tickets move automatically to resolved/cancelled sections based on status.

## Prerequisites

- Java 21
- Node.js 18+ and npm
- MySQL 8+
- Maven (or use Maven Wrapper if added)

## Environment and Configuration

### Backend (`backend/src/main/resources/application.properties`)

Configure:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `spring.security.oauth2.client.registration.google.client-id`
- `spring.security.oauth2.client.registration.google.client-secret`

Optional mail settings (`spring.mail.*`) enable real email delivery for ticket replies.

### Frontend

Optional environment variable:

- `REACT_APP_API_BASE_URL` (if not set, frontend uses relative API paths/proxy behavior)

## Running the Project

### 1) Start Backend

From `backend/`:

```bash
mvn spring-boot:run
```

Backend default: `http://localhost:8080`

### 2) Start Frontend

From `frontend/`:

```bash
npm install
npm start
```

Frontend default: `http://localhost:3000`

## Default Route Map (Frontend)

- Public:
  - `/`
  - `/login`
  - `/resources`
  - `/resources/:id`
- Authenticated:
  - `/dashboard`
  - `/notifications`
  - `/bookings/my`
  - `/incidents/my`
- Admin/Technician:
  - `/admin/dashboard`
  - `/admin/resources`
  - `/bookings/admin`
  - `/incidents/admin`
  - `/incidents/admin/:id`
  - `/incidents/technician`

## Development Notes

- Backend uses `spring.jpa.hibernate.ddl-auto=update` currently.
- Keep credentials and secrets out of source control; prefer environment variables for production.
- CORS is currently configured for `http://localhost:3000`.

## Future Improvements

- Add Docker setup for backend/frontend/database
- Add integration tests for booking and incident workflows
- Add CI pipeline for build + test + lint checks
- Add API documentation (OpenAPI/Swagger)
