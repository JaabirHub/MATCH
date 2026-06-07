# Friend Matching App

A full‑stack web application that helps people find compatible friends or activity partners based on shared interests, location, and availability.

Built as a portfolio‑grade project using **NestJS + TypeORM + PostgreSQL** on the backend and **Next.js (App Router)** on the frontend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment variables](#environment-variables)
  - [Running the app](#running-the-app)
- [Scripts](#scripts)
- [Testing](#testing)
- [CI](#ci)

---

## Overview

The goal of this app is to make it easier for students and young professionals to meet like‑minded people nearby for recurring activities (gym, studying, gaming, language exchange, etc.).

Instead of being a dating app, it focuses on **friendship and activities**, using a structured matching system and built‑in safety controls.

---

## Features

**MVP**

- Email registration and login.
- Onboarding flow to complete a profile (bio, city, availability).
- Interest selection (tags) and preferences (distance, age range, activity types).
- Suggestions feed with users ranked by compatibility.
- Connection requests (send, accept, decline).
- 1:1 messaging between accepted connections.
- Blocking and reporting.

**Planned / stretch**

- Group activities and events (e.g. “Tuesday Gym Crew in Stratford”).
- Group chat for events.
- Reliability/reputation indicators.
- More advanced matching that considers recent activity and response rates.

---

## Architecture

- **Backend**: NestJS REST API with a modular, feature‑based structure.
  - `Auth` (JWT), `Users`, `Profiles`, `Matching`, `Connections`, `Chat`, `Admin`.
  - PostgreSQL database accessed via TypeORM.
  - TypeORM auto‑creates tables from entities in development (`synchronize: true`), migrations for later environments.
- **Frontend**: Next.js app (TypeScript, App Router).
  - Auth pages, onboarding, suggestions feed, matches, messages, settings.
  - Uses a typed API client to talk to the NestJS backend.
- **Database**: PostgreSQL (via Docker Compose for local dev).
- **CI**: GitHub Actions workflow that installs dependencies, lints, tests, and builds both backend and frontend on each push/PR.

---

## Tech Stack

**Backend**

- [NestJS](https://docs.nestjs.com/) – Node.js framework for scalable server‑side apps.
- [TypeORM](https://typeorm.io/) – ORM for PostgreSQL with decorators and repository pattern.
- [PostgreSQL](https://www.postgresql.org/) – relational database.
- JWT authentication.
- Jest for testing.

**Frontend**

- [Next.js](https://nextjs.org/) (App Router, TypeScript).
- React, CSS (or Tailwind / UI library if added).
- Jest / React Testing Library (planned).

**Tooling / DevOps**

- Docker Compose for Postgres (and later Redis).
- GitHub Actions for CI.

---

## Project Structure

```text
friend-matching-app/
  backend/                     # NestJS API (TypeORM + PostgreSQL)
    src/
      main.ts
      app.module.ts
      auth/ ...
      users/ ...
      profiles/ ...
      matching/ ...
      connections/ ...
      chat/ ...
      common/ ...
    test/
    package.json
    ...

  frontend/                    # Next.js UI
    app/
      (auth)/ ...
      (onboarding)/ ...
      (main)/ ...
      layout.tsx
      globals.css
    components/
    lib/
    public/
    package.json
    ...

  .github/
    workflows/
      ci.yml                   # GitHub Actions CI for backend + frontend

  docker-compose.yml           # Local Postgres, etc.
  .gitignore
  README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18 or 20
- npm
- Docker (for local Postgres), or a running PostgreSQL instance

### Environment variables

Create `backend/.env` visit backend/.env.example:

Create `frontend/.env` visit frontend/.env.example:

(Adjust ports to match your backend config.)

### Running the database

Using Docker Compose from the repo root:

```bash
docker compose up -d
```

This will start a Postgres container with the database configured in `docker-compose.yml`.

---

## Running the app

From the repo root:

- **Backend (NestJS)**

  ```bash
  cd backend
  npm install
  npm run start:dev
  ```

- **Frontend (Next.js)**

  ```bash
  cd frontend
  npm install
  npm run dev
  ```

The frontend will talk to the backend via `NEXT_PUBLIC_API_URL`.

If you have a root `package.json`, you can also add helper scripts such as:

```json
{
  "scripts": {
    "dev:backend": "npm --prefix backend run start:dev",
    "dev:frontend": "npm --prefix frontend run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

---

## Scripts

**Backend**

- `npm run start:dev` – start NestJS in watch mode.
- `npm run build` – build backend.
- `npm run lint` – lint backend code.
- `npm test` – run backend tests.

**Frontend**

- `npm run dev` – start Next.js dev server.
- `npm run build` – create production build.
- `npm run lint` – run ESLint on frontend.
- `npm test` – run frontend tests (when added).

---

## Testing

- Backend tests live under `backend/test/` and are run with `npm test` inside `backend`.
- Frontend tests live under `frontend/__tests__/` (or similar) and are run with `npm test` inside `frontend`.

---

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

- Triggers on pushes and pull requests to `main` (and `develop`).
- Jobs:
  - **Backend**: install, lint, test, build.
  - **Frontend**: install, lint, test, build.
- Intended to be required checks before merging into `main` (via branch protection).
