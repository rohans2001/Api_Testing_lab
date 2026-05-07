# Local API Testing Laboratory (Enterprise Edition)

A highly advanced, enterprise-grade backend simulation platform designed for realistic QA, API testing, automation, security, and observability practice.

## Overview
This laboratory is built on Node.js and Express to simulate a production backend system. It features distributed system patterns, advanced authentication, webhook management, GraphQL, realtime WebSockets, chaos engineering tools, and extensive security vulnerabilities for penetration testing.

## Key Features

1. **Enterprise Observability**
   - Correlated Request IDs (`X-Request-Id`)
   - Structured JSON logging (`app.log`, `error.log`, `audit.log`)
   - Slow response detection

2. **Advanced Authentication**
   - JWT Access & Refresh Token rotation
   - Device Session Management (track and kill active sessions)
   - Account Lockouts (after 3 failed attempts)
   - Role Hierarchy (Super Admin, Admin, Manager, User, Guest)

3. **Resiliency & Chaos Engineering**
   - Configurable Chaos Monkey: intercept requests to inject latency, 5xx errors, corrupted JSON, or drop connections.
   - Third-Party Failure Mocks (Stripe, Email, SMS timeouts).

4. **Async Jobs & Idempotency**
   - Polling endpoints for background jobs (`/api/jobs`).
   - `Idempotency-Key` header support to prevent duplicate payments.

5. **Security Testing Endpoints**
   - Intentional vulnerabilities (`/api/vulnerable`) for IDOR, Mass Assignment, and Open Redirect practice.

6. **GraphQL & Realtime**
   - Dual-protocol support: REST APIs and GraphQL (`/graphql`).
   - WebSocket (`Socket.IO`) realtime notifications.

## Getting Started

1. `npm install`
2. `npm run dev`

### Optional: Massive Test Data
To load test the system with pagination and search:
`node scripts/seed.js` (Generates 10k users and 50k products)

## Testing Workflows

**1. Chaos Testing**
Enable `SIMULATE_RANDOM_ERRORS=true` in your `.env` to experience unpredictable backend behavior.

**2. Contract & Automation**
Import `docs/swagger.json` or `docs/postman_collection.json`. The endpoints validate strict schemas.

**3. Observability**
Check the `logs/` directory during testing to trace correlation IDs across simulated microservices (`/api/services/*`).
