# ShobMail

## Description

A backend API platform for Gmail email analytics built with Bun and Hono. ShobMail lets users connect their Google accounts, sync Gmail emails, and receive AI-powered insights about their email activity — including sender analysis, domain breakdowns, and email categorization.

Key capabilities:
- Google OAuth2 authentication with cookie-based JWT session management.
- Gmail inbox syncing with paginated fetching and concurrent message retrieval.
- AI-powered email classification using Google Gemini for source breakdowns.
- Async background processing via BullMQ with Redis-backed queues.
- Email statistics and analytics: top senders, domains, categories, and new senders.
- Encrypted credential storage with AES-256-GCM encryption.

## Features

- Google OAuth2 Authentication — Secure sign-in via Google with encrypted token storage and cookie-based JWT authentication with access/refresh token rotation.
- Gmail Sync — Paginated email fetching (up to a configurable limit) with concurrent message retrieval and HTML-to-text conversion.
- Email Statistics — Analyze sender patterns, top domains, category distributions, and newly seen senders within a configurable time window.
- AI Email Classification — Google Gemini-powered classification of emails into categories: personal, business, marketing, notifications, newsletters, or unknown.
- Async Processing — BullMQ background workers handle Gmail syncing and statistical analysis asynchronously with Redis-backed queues.
- Security — AES-256-GCM encryption for OAuth tokens, JWT with httpOnly cookies, Zod validation for all API inputs.
- Dashboard — Two-phase analytics: submit a request and retrieve results by ID once processing is complete.

## Tech Stack

- Runtime: Bun 1.x
- Language: TypeScript 5 (strict mode)
- Framework: Hono 4
- Database: PostgreSQL, Drizzle ORM
- Queue: BullMQ, Redis (via IORedis)
- Auth: Google OAuth2, jsonwebtoken (cookie-based JWT)
- AI: Google Gemini API
- Encryption: Node.js crypto (AES-256-GCM)
- Validation: Zod 4
- Email Parsing: html-to-text
- Dev Tooling: drizzle-kit, tsx

## Architecture

The application follows a modular monolith structure organized by domain. Each module owns its routes, controllers, and services with no cross-boundary leakage.

Core modules:
- `auth` — Google OAuth2 authentication, JWT token generation and refresh with cookie-based rotation.
- `gmail` — Google OAuth2 flow, Gmail API integration, email syncing, and data parsing.
- `statistics` — Email analytics engine that computes sender insights, domain breakdowns, category counts, and AI-based source classification.
- `worker` — BullMQ background worker processing email sync and analysis jobs.

Infrastructure:
- `shared/database` — Drizzle ORM setup with PostgreSQL and schema definitions.
- `shared/queue` — BullMQ queue producer and worker with Redis connection.
- `shared/redis` — Redis client for BullMQ queue management.
- `shared/auth` — Google OAuth2 client configuration and JWT utilities.
- `shared/encryption` — AES-256-GCM encrypt/decrypt helpers for OAuth credentials.
- `shared/ai` — Google Gemini integration for bulk email classification.
- `shared/middlewares` — JWT-based auth middleware reading tokens from httpOnly cookies.
- `shared/errors` — Custom error class with HTTP status codes.
- `shared/validation` — Zod validation schemas for request parameters.

## Setup Instructions

### Prerequisites
- Bun 1.x
- PostgreSQL running locally
- Redis running locally
- Google Cloud project with OAuth2 credentials
- Google Gemini API key

### Steps

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Fill in CLIENT_ID, CLIENT_SECRET, OAUTH_ENCRYPTION_KEY, DATABASE_URL, REDIS_CONNECTION_URL, JWT_SECRET, GMAIL_LIMIT, GEMINI_API_KEY
   ```

3. Push database schema:
   ```bash
   bun run db:push
   ```

4. Start the dev server:
   ```bash
   bun run dev
   ```

5. Start the background worker (in a separate terminal):
   ```bash
   bun run worker:dev
   ```

## API Endpoints

- `GET /api/gmail/connect` — Initiate Google OAuth2 flow.
- `GET /api/gmail/callback` — OAuth2 callback, syncs emails and sets JWT cookies.
- `POST /api/auth/refresh-token` — Refresh access and refresh tokens.
- `POST /api/auth/logout` — Invalidate session by clearing cookies.
- `GET /api/statistics/sender-source-info` — Submit analytics request (requires auth).
- `GET /api/statistics/sender-source-info-results/:id` — Retrieve analytics results by ID (requires auth).
- `GET /` — Health check.

## Contributing

Contributions, issues, and feature requests are welcome.

## License

MIT License. Copyright (c) 2026 Mohammad Arkan.
