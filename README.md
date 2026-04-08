# MedReq

MedReq is a modern medical intake and analysis web application built with Next.js and Firebase.

It allows authenticated users to submit symptoms and vitals, run server-side analysis workflows, and review structured results with citations and confidence signals.

Current release: v0.1.0

## Leadership And Credits

- Owner and Product Vision: Fara Aysha
- Product Idea, Lead Planning, and Direction: Fara Aysha
- Prime Contributor: LordSA
	- GitHub: https://github.com/LordSA
	- Portfolio: https://www.shibili.tech

Additional contributors can be found in CONTRIBUTORS.md.

## Core Features

- Secure session-based authentication with server verification.
- Protected routes for dashboard and results pages.
- Analyze endpoint with strict validation and normalization.
- Range checks for core medical fields.
- Request hardening:
	- same-origin checks
	- payload caps
	- rate limiting
	- idempotency key handling
- Async analysis job flow (queued, processing, analyzed, failed).
- Job recovery utilities (retry and queue drain endpoints).
- Structured observability helpers and request IDs.
- Export report PDF via server route.
- Dashboard list performance improvements via report summary read model.
- Optional prescription upload flow without Firebase Storage (Cloudinary-based).
- Unit tests for schema and clinical scoring logic.

## Tech Stack

- Frontend: Next.js 16, React 19, Tailwind CSS, Framer Motion
- Backend/API: Next.js App Router route handlers
- Data: Firestore (via Firebase Admin SDK)
- Auth: Firebase Auth + server-managed session cookie
- Validation: Zod
- Testing: Vitest

## Project Structure

- src/app
	- Route handlers under src/app/api
	- App pages under src/app/dashboard, src/app/results, and auth routes
- src/lib
	- Auth, schema, analysis, rate limit, observability, and upload utilities
- firestore.rules
	- Firestore security rules
- firestore.indexes.json
	- Composite indexes for performance

## API Overview

- POST /api/auth/session
	- Creates secure session cookie from Firebase ID token.
- DELETE /api/auth/session
	- Clears secure session cookie.
- GET /api/auth/verify
	- Verifies current session.
- POST /api/analyze
	- Validates intake, applies security controls, enqueues analysis job.
- POST /api/analyze/worker
	- Processes queued jobs and writes analysis output.
- GET /api/analyze/[id]
	- Returns report status for polling.
- POST /api/analyze/retry
	- Requeues a failed report for processing.
- POST /api/analyze/drain
	- Drains queued jobs in batches.
- POST /api/uploads/prescription
	- Optional upload endpoint when external upload is enabled.
- GET /api/results/[id]/pdf
	- Generates server-side PDF output for a report.
- GET /api/metrics
	- Returns service metrics (protected via API key).

## Local Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- Firebase project with Firestore

### Install

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

### Run Lint And Tests

```bash
pnpm lint
pnpm test
```

## Environment Variables

This project uses .env.local.

### Firebase

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY

### Analysis Worker Security

- ANALYZE_WORKER_SECRET
- ANALYZE_DRAIN_BATCH_SIZE
- ANALYZE_DRAIN_MAX_BATCHES

### Metrics Endpoint

- METRICS_API_KEY

### Optional External Prescription Upload

- NEXT_PUBLIC_ENABLE_PRESCRIPTION_UPLOAD
	- false keeps current app behavior unchanged.
	- true enables upload UI and upload API usage.
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_UPLOAD_FOLDER

## Release Notes (v0.1.0)

- Migrated auth verification to server-managed sessions.
- Rebuilt analyze flow with strict schema validation and abuse protections.
- Added asynchronous worker processing and queue recovery endpoints.
- Added report summary denormalization for faster dashboard reads.
- Added server PDF generation route for report exports.
- Added baseline unit, integration, and E2E smoke tests.

## Prescription Upload Without Firebase Storage

MedReq supports prescription upload without a Firebase Storage bucket.

Current implementation uses Cloudinary as external file storage and stores metadata (URL, file name, type, size) with the report.

Important:

- The feature is disabled by default.
- Enabling it requires the upload env variables.
- Server-side validation enforces type and file size boundaries.

## Security Practices

- Server-side session verification.
- HttpOnly session cookie with strict policy.
- Same-origin request checks for sensitive endpoints.
- No-store security headers for protected API responses.
- Input validation and normalization through Zod.
- Request rate limiting and idempotency.

See SECURITY.md for reporting guidelines and supported versions.

## Contribution Guide

Community contributions are welcome.

How to contribute:

1. Open an issue describing the bug, idea, or enhancement.
2. Wait for triage and implementation direction.
3. Submit a pull request linked to the issue.
4. Include tests for behavior changes.

Primary intake path for contributors is raising a GitHub issue.

## Roadmap Priorities

- Expand integration and E2E test coverage.
- Add richer operational metrics dashboards.
- Improve job processing orchestration for production load.
- Continue tuning analysis quality and medical evidence mapping.

## License

This project is licensed under the MIT License.

See LICENSE for details.
