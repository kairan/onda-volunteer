# Architecture Prompt: Church Volunteer Management System (DDD + Deep Modules)

## 🎯 Objective
Build a scalable web application for managing volunteers, schedules, and ministries, prioritizing data integrity, maintainability, and a frictionless user experience.

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite), TanStack Router (Type-safe navigation), TanStack Query (Server state management).
- **Backend:** NestJS (Node.js framework).
- **Database:** PostgreSQL via **Supabase**.
- **ORM:** Prisma.
- **Authentication:** Supabase Auth (Passwordless/OTP via Email).

---

## 🏗️ Design Principles (Mandatory)
1. **Domain-Driven Design (DDD):** Isolate business logic into Bounded Contexts (`Identity`, `Organization`, `Scheduling`, `Availability`).
2. **Deep Modules (John Ousterhout):** Simple interfaces, deep implementations. Domain modules must encapsulate all validation logic and conflict rules internally.
3. **Ubiquitous Language:** Use terms like `Volunteer`, `Leader`, `Ministry`, `Assignment`, `Event`, and `Unavailability` consistently throughout the code.

---

## 📋 Business Rules & Domain Logic

### 1. Hierarchy and Roles
- **Admin:** Creates ministries and delegates leaders.
- **Leader:** Manages volunteers and schedules within their assigned ministries.
- **Volunteer:** Can belong to multiple ministries and register "Unavailability" (blockout dates).

### 2. Events and Scheduling
- **Private Events:** Visible and manageable only by the creating ministry (e.g., Band Rehearsal).
- **Public Events:** Global events (e.g., Sunday Service) where leaders from different ministries can assign their respective volunteers to the same event.
- **Unavailability:** Volunteers mark when they are **not** available. The system must block assignments during these periods.
- **Schedule Conflicts:** A volunteer cannot be scheduled for two different roles/events at the same time, even across different ministries.

---

## 📝 Requested Deliverables

### Step 1: Data Modeling (Prisma)
Generate the `schema.prisma` file reflecting the entities and relationships (1:1, 1:N, N:N) required to support the rules above, including Enums for different user roles.

### Step 2: Backend Folder Structure (NestJS + DDD)
Propose a backend directory structure following DDD patterns, isolating `Domain` (Entities/Value Objects), `Application` (Services/Use Cases), `Infrastructure` (Prisma/Repositories), and `Presentation` (Controllers).

### Step 3: Deep Module Implementation (Scheduling)
Implement the `SchedulingService` in NestJS. The `assignVolunteerToEvent` method must:
1. Validate if the executor is the authorized Leader or Admin.
2. Check if the volunteer belongs to the ministry for that assignment.
3. Validate against the `Unavailability` table.
4. Check for overlapping `Assignments` (time conflicts).
5. Return clear Domain Errors or the success operation.

### Step 4: Frontend Integration (TanStack Router)
Show an example of setting up a protected route and a `loader` that consumes this domain data in a strictly typed manner using the generated Prisma types.