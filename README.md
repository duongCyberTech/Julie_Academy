# Julie Academy

An intelligent online tutoring platform with adaptive learning capabilities, real-time collaboration, and ML-powered student performance analysis.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Services](#services)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Useful Docker Commands](#useful-docker-commands)
- [CI/CD](#cicd)

---

## Overview

Julie Academy is a microservices-based e-learning platform that connects tutors and students. It provides:

- Class management and enrollment
- Exam creation, delivery, and grading
- Real-time notifications and collaboration via WebSockets
- Adaptive learning recommendations powered by machine learning
- Automated data pipelines for student performance analytics
- Rich content editing with math rendering support

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Frontend                          │
│              React 18 + Vite (port 5173)                │
└────────────────────┬───────────────┬────────────────────┘
                     │               │
          ┌──────────▼──────┐  ┌─────▼────────────────┐
          │  tutor-service  │  │  adaptive-learning-  │
          │  NestJS / TS    │  │      service         │
          │   (port 4000)   │  │  FastAPI / Python    │
          │  REST + WS      │  │   (port 8000)        │
          └────────┬────────┘  └──────────┬───────────┘
                   │                      │
         ┌─────────▼──────────────────────▼──────────┐
         │           Shared Infrastructure             │
         │  PostgreSQL │ Redis │ RabbitMQ              │
         └─────────────────────────────────────────────┘
                                │
         ┌──────────────────────▼──────────────────────┐
         │              Data Pipeline                   │
         │  Apache Spark + Celery Beat (ETL jobs)       │
         └──────────────────────────────────────────────┘
```

**Communication patterns:**
- REST HTTP between frontend ↔ backend services
- Socket.IO WebSocket for real-time events (tutor-service)
- RabbitMQ AMQP for inter-service messaging
- Celery + Redis for async background task queues
- Apache Spark for scheduled batch ETL

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Material-UI, React Router, Socket.IO Client, Recharts, TipTap, KaTeX |
| API (Primary) | NestJS 11, TypeScript, Prisma ORM, Passport JWT, Bull/BullMQ |
| API (ML) | FastAPI, Python 3.11, SQLAlchemy 2.0 (async), Alembic, Pydantic |
| Machine Learning | Scikit-learn, NumPy, Pandas |
| Data Pipeline | Apache Spark 4.1.1, PySpark, Celery 5.x |
| Database | PostgreSQL (2 separate databases) |
| Cache / Queue | Redis (persistence + LRU eviction, 512 MB) |
| Messaging | RabbitMQ (AMQP) |
| Monitoring | Prometheus metrics (tutor-service) |
| Infrastructure | Docker, Docker Compose, CircleCI |

---

## Services

### tutor-service (Port 4000)

The main backend API built with NestJS. Handles all core platform logic:

- **Auth** — JWT-based authentication and authorization
- **Users** — Tutor and student profiles, roles
- **Classes** — Class creation, enrollment, management
- **Exams & Questions** — Full exam lifecycle (create, deliver, grade)
- **Dashboard** — Performance analytics and radar charts
- **Notifications** — Real-time alerts via Socket.IO
- **Email** — Transactional emails via Gmail SMTP
- **Background Jobs** — Cron scheduling, Bull queues
- **Metrics** — Prometheus integration for API tracking

Database: PostgreSQL (`julie` database) managed via Prisma.

---

### adaptive-learning-service (Port 8000)

A Python ML service that provides adaptive learning features:

- **ML Model Training & Inference** — Scikit-learn models for student performance prediction
- **Adaptive Recommendations** — Personalised learning paths based on student data
- **Async Processing** — Celery workers for long-running ML tasks
- **RabbitMQ Consumer** — Listens for events from tutor-service

Database: PostgreSQL (`model_db` database) managed via Alembic.

---

### data-pipeline (Celery Beat + Apache Spark)

Scheduled ETL pipeline that feeds the ML service:

1. **Celery Beat** triggers the `trigger_spark` task on schedule
2. **Spark job** extracts latest exam session data from PostgreSQL
3. Transforms raw results into skill-based aggregates
4. Loads processed data into `sections` and `training_data` tables

---

### frontend (Port 5173)

Single-page React application:

- Student and tutor dashboards with analytics charts
- Exam interface with math rendering (KaTeX)
- Rich text editor (TipTap) for content creation
- Drag-and-drop question ordering (@dnd-kit)
- Real-time notifications (Socket.IO)
- Responsive layout with Material-UI

---

### Infrastructure

| Service | Port | Purpose |
|---|---|---|
| PostgreSQL | 5432 | Primary relational database |
| Redis | 6379 | Cache, Celery broker, Bull queues |
| RabbitMQ | 5672 | AMQP message broker |
| RabbitMQ UI | 15672 | Management dashboard |

---

## Prerequisites

- [Docker](https://www.docker.com/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) >= 2
- [Node.js](https://nodejs.org/) >= 22 (for local frontend/tutor-service development)
- [Python](https://www.python.org/) >= 3.11 (for local adaptive-service development)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/duongCyberTech/Julie_Academy.git
cd Julie_Academy
```

### 2. Configure environment variables

Copy and fill in the environment files:

```bash
cp .env.tutor.example .env.tutor
cp .env.adaptive.example .env.adaptive
```

See [Environment Variables](#environment-variables) for required values.

### 3. Start all services

```bash
docker compose up --build
```

Services start in this order: RabbitMQ → Redis → tutor-service → adaptive-service → worker → beat.

### 4. Run database migrations

After all services are healthy:

```bash
# Tutor service (Prisma)
docker compose exec tutor-service npx prisma migrate deploy

# Adaptive service (Alembic)
docker compose exec adaptive-service alembic upgrade head
```

### 5. Access the platform

| URL | Description |
|---|---|
| http://localhost:5173 | Frontend |
| http://localhost:4000/api/docs | Tutor API (Swagger) |
| http://localhost:8000/docs | Adaptive API (Swagger) |
| http://localhost:15672 | RabbitMQ Management (dev / julie) |

---

## Environment Variables

### .env.tutor

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 4000) |
| `DATABASE_URL` | PostgreSQL connection string (julie DB) |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRATION` | Token expiry duration |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Redis connection |
| `RABBITMQ_URL` | RabbitMQ AMQP URL |
| `MAIL_USER` / `MAIL_PASS` | Gmail SMTP credentials |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `S3_BUCKET_NAME` | AWS S3 bucket |
| `CLOUDINARY_*` | Cloudinary media storage |
| `RATE_LIMIT_BYPASS_TOKEN` | Token to bypass rate limiting |

### .env.adaptive

| Variable | Description |
|---|---|
| `DATABASE_URL` | Synchronous PostgreSQL URL (model_db) |
| `DATABASE_ASYNC_URL` | Async PostgreSQL URL (model_db) |
| `JWT_SECRET` / `JWT_ALGO` | JWT verification config |
| `RABBITMQ_URL` | RabbitMQ AMQP URL |
| `REDIS_URL` | Redis connection URL |

---

## API Documentation

Both services expose interactive Swagger UIs:

- **Tutor Service:** `http://localhost:4000/api/docs`
- **Adaptive Service:** `http://localhost:8000/docs`

### Key Tutor Service Endpoints

| Module | Base Path |
|---|---|
| Auth | `/auth` |
| Users | `/users` |
| Classes | `/classes` |
| Exams | `/exams` |
| Questions | `/questions` |
| Dashboard | `/dashboard` |
| Analysis | `/analysis` |
| Notifications | `/notifications` |

---

## Project Structure

```
Julie_Academy/
├── tutor-service/              # NestJS primary API
│   ├── src/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── class/
│   │   ├── exam/
│   │   ├── question/
│   │   ├── dashboard/
│   │   ├── analysis/
│   │   ├── mail/
│   │   └── notifications/
│   ├── prisma/                 # Prisma schema & migrations
│   └── Dockerfile
├── adaptive-learning-service/  # FastAPI ML service
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   ├── worker/                 # Celery workers
│   ├── migrations/             # Alembic migrations
│   └── Dockerfile
├── frontend/                   # React + Vite SPA
│   ├── src/
│   └── vite.config.js
├── data_pipeline/              # Spark ETL + Celery Beat
├── docker/
│   └── redis/
│       └── redis.conf
├── .circleci/                  # CircleCI CI/CD config
├── docker-compose.yml
├── .env.tutor
└── .env.adaptive
```

---

## Useful Docker Commands

### Rebuild and start a single service

```bash
docker compose up tutor-service --build
```

### Open a NestJS REPL console

```bash
docker compose exec tutor-service npm run start -- --watch --entryFile repl
```

### Prisma migrations (tutor-service)

```bash
# Create and apply a new migration
docker compose exec tutor-service npx prisma migrate dev

# Regenerate the Prisma client
docker compose exec tutor-service npx prisma generate
```

### Alembic migrations (adaptive-service)

```bash
# Apply all pending migrations
docker compose exec adaptive-service alembic upgrade head

# Create a new migration
docker compose exec adaptive-service alembic revision --autogenerate -m "description"
```

### View logs

```bash
docker compose logs -f tutor-service
docker compose logs -f adaptive-service
```

---

## Database Overview

| Database | Service | ORM | Purpose |
|---|---|---|---|
| `julie` | tutor-service | Prisma | Users, classes, exams, questions, notifications |
| `model_db` | adaptive-service | SQLAlchemy + Alembic | ML model metadata, training data, section aggregates |

---

## CI/CD

The project uses **CircleCI** for continuous integration, configured in `.circleci/`:

- `config.yml` — Base pipeline configuration
- `tutor-service-config.yml` — Tutor service pipeline (automated testing, Docker builds)

Pipelines are triggered on push and run tests before building Docker images.
