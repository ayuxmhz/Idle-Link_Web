# IdleLink Backend

REST API for IdleLink — a compute marketplace where users list idle devices for rent and book devices from others. Built with Express, TypeScript, and Mongoose (MongoDB).

## Features

- JWT-based auth (register/login/logout), Google sign-in, email OTP verification, forgot/reset password
- Device listings with booking lifecycle (request, accept, cancel, complete) and post-booking ratings
- Wallet system with eSewa payment integration for deposits and withdrawals
- AI-powered job matcher (Google Gemini) that recommends devices for a natural-language request
- Admin dashboard endpoints (users, devices, transactions, stats)
- In-app notifications for booking/wallet events
- HATEOAS `_links` on device and booking responses, plus conditional GET (ETag/304) support

## Prerequisites

- [Bun](https://bun.sh) (runtime and package manager)
- A running MongoDB instance (local or Atlas)

## Setup

```bash
bun install
cp .env.example .env   # then fill in values as needed (see below)
bun run dev            # starts the API on http://localhost:8089 with --watch
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the API with file-watch auto-restart |
| `bun run start` | Start the API without watch mode |
| `bun run test` | Run the test suite once |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests and print a coverage report |
| `bun run lint` | Run ESLint |

## Environment variables

All variables are documented in `.env.example`. Highlights:

| Variable | Required? | Notes |
|---|---|---|
| `PORT` | No | Defaults to `8089`. |
| `MONGODB_URL` | No | Defaults to a local `idlelink-db` database. |
| `SECRET_KEY` | Recommended | JWT signing secret. Falls back to an insecure default — always set your own outside local dev. |
| `FRONTEND_URL` | No | Used to build eSewa's success/failure redirect URLs. Defaults to `http://localhost:3000`. |
| `RESEND_API_KEY` | For real email delivery | Email OTP and password-reset emails, sent via [Resend](https://resend.com/api-keys). Without it, the code is logged to the console instead of failing the request — every other feature works fine without it. |
| `RESEND_FROM_EMAIL` | No | Defaults to Resend's shared `onboarding@resend.dev` sender, which works without verifying a domain. |
| `ESEWA_*` | No | Defaults to eSewa's own published **test/sandbox** credentials (merchant code `EPAYTEST`). Safe for local development — no real money moves. Only override these with real merchant credentials for a production deployment. |
| `GEMINI_API_KEY` | For the AI Matcher only | Get a key from [Google AI Studio](https://aistudio.google.com/apikey). Without it, the `/api/v1/matcher` endpoint returns a clear "not configured" error instead of crashing — every other feature works fine without it. |

## Architecture

Each domain (User, Device, Booking, Transaction, eSewa, Matcher) follows the same layered pattern:

```
types/*.type.ts        zod schema + inferred type
models/*.model.ts       Mongoose schema/model
dtos/*.dto.ts            zod DTOs for request validation
repositories/*.repository.ts   data access (Mongo queries only)
services/*.service.ts     business logic, throws HttpException on failure
controllers/*.controller.ts  parses/validates request, calls service, formats response
routes/*.route.ts          wires controller methods to Express routes
```

All responses use the shared `ApiResponseHelper` shape (`{ status, success, message, data, meta? }`). Auth is JWT-based via `authorizedMiddleware`; admin-only routes add `adminMiddleware` on top.

## Testing the eSewa flow locally

eSewa's sandbox has its own test login (separate from IdleLink's accounts):

- eSewa ID: any of `9806800001` – `9806800005`
- Password: `Nepal@123`
- MPIN: `1122`
- OTP: `123456`

## Testing the AI Matcher locally

Set `GEMINI_API_KEY` in `.env`, restart the server, then `POST /api/v1/matcher` with `{ "query": "I need a GPU for fine-tuning a small language model" }` (Bearer token required).
