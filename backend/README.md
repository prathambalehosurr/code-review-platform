# Backend

Express and TypeScript backend for the AI-Powered Code Review & Mentorship Platform.

## Requirements

- Node.js 20 or newer
- npm

## Setup

```bash
npm install
cp .env.example .env
```

## Configuration

Environment variables are loaded from `.env`, validated with Zod, and exposed through the
central configuration module in `src/config`. Application code should import configuration
from there instead of reading `process.env` directly.

Supported variables:

- `NODE_ENV`: `development`, `test`, or `production`
- `PORT`: backend port, defaults to `5000`
- `LOG_LEVEL`: `error`, `warn`, `info`, or `debug`
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_SERVER_SELECTION_TIMEOUT_MS`: MongoDB connection timeout in milliseconds
- `JWT_ACCESS_SECRET`: access-token signing secret, minimum 32 characters
- `JWT_REFRESH_SECRET`: refresh-token signing secret, minimum 32 characters
- `JWT_ACCESS_EXPIRES_IN`: access-token lifetime, for example `15m`
- `JWT_REFRESH_EXPIRES_IN`: refresh-token lifetime, for example `7d`
- `CLIENT_URL`: frontend application URL
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `GITHUB_CALLBACK_URL`: GitHub OAuth callback URL
- `GITHUB_WEBHOOK_SECRET`: secret used to verify `X-Hub-Signature-256` on incoming GitHub webhooks
- `REDIS_URL`: Redis connection URL, for example `redis://localhost:6379`

## Database

The backend uses Mongoose for MongoDB. Configure `MONGODB_URI` in `.env` before starting
the server:

```bash
MONGODB_URI=mongodb://localhost:27017/ai-code-review-platform
```

The application connects to MongoDB during startup, prevents duplicate connection attempts,
and closes the connection during `SIGINT` and `SIGTERM` shutdowns.

## Authentication Foundation

The backend includes reusable authentication infrastructure for future GitHub OAuth work:

- `User` Mongoose model with indexed `email`, `githubId`, and `username` fields
- `UserRepository` for user persistence access
- JWT helpers for generating and verifying access and refresh tokens
- Cookie helpers for setting and clearing HTTP-only auth cookies
- Shared auth types and constants

GitHub OAuth is available through Passport:

- `GET /api/v1/auth/github`: redirects the browser to GitHub
- `GET /api/v1/auth/github/callback`: handles the GitHub callback, creates or updates the user,
  sets HTTP-only JWT cookies, and redirects to `${CLIENT_URL}/dashboard`
- `GET /api/v1/auth/me`: returns the current authenticated user
- `POST /api/v1/auth/refresh`: verifies the refresh cookie, rotates JWT cookies, and returns success
- `POST /api/v1/auth/logout`: clears auth cookies and returns success

If GitHub authentication fails, the callback redirects to
`${CLIENT_URL}/login?error=github_auth_failed`.

Access and refresh tokens are stored only in HTTP-only cookies. Tokens are never returned in JSON
responses.

Repository permission checks, GitHub API access, repository connection flows, refresh-token storage,
and role-based authorization are intentionally not implemented yet.

## Repository Management

Authenticated users can manage repository records through database-backed APIs:

- `GET /api/v1/repositories`: list the authenticated user's repositories
- `GET /api/v1/repositories/:id`: get one owned repository
- `POST /api/v1/repositories`: create a repository record
- `PATCH /api/v1/repositories/:id/connect`: mark an owned repository as connected
- `PATCH /api/v1/repositories/:id/disconnect`: mark an owned repository as disconnected
- `DELETE /api/v1/repositories/:id`: delete an owned repository record
- `POST /api/v1/repositories/sync`: fetch the authenticated user's GitHub repositories and
  synchronize database records

Repository ownership is enforced in the service layer. Requests for another user's repository return
`404`.

Repository sync uses the OAuth access token from an HTTP-only cookie created during GitHub login.
GitHub OAuth access tokens are not stored in MongoDB and are not returned in JSON responses.

This module does not register webhooks, use GitHub Apps, process pull requests, enqueue jobs, or run
AI review workflows.

## GitHub Webhooks

The backend receives GitHub webhook events at:

- `POST /api/v1/webhooks/github`

Every request is verified against the `X-Hub-Signature-256` header using HMAC-SHA256 and
`crypto.timingSafeEqual`. Requests with a missing or invalid signature are rejected with `401`.

Supported events:

| Event          | Response | Behaviour                                                            |
| -------------- | -------- | -------------------------------------------------------------------- |
| `ping`         | `200`    | Returns `{ "success": true, "message": "GitHub webhook verified." }` |
| `pull_request` | `202`    | Normalises the payload and returns it                                |
| Any other      | `202`    | Silently accepted, no processing performed                           |

Normalised `pull_request` payload:

```json
{
  "event": "pull_request",
  "action": "opened",
  "repositoryId": 123456,
  "repositoryFullName": "owner/repo",
  "pullRequestNumber": 42,
  "installationId": 1234,
  "sender": "username",
  "timestamp": "2026-01-01T00:00:00Z"
}
```

Raw body capture is scoped only to the webhook router. The existing `express.json()` middleware
continues to work unchanged for all other routes.

Supported pull_request events automatically enqueue a background job. No database writes or AI calls are performed directly in the webhook handler.

## Background Processing (BullMQ & Redis)

The backend utilizes Redis and BullMQ to handle long-running code review tasks asynchronously.

### Queue Configuration

- **Queue Name**: `review`
- **Redis Connection**: Connected via `REDIS_URL` with `maxRetriesPerRequest: null`.
- **Default Job Options**:
  - `attempts`: 3
  - `backoff`: exponential, `delay` = 2000ms

### Job Types

#### `review.pull_request`

Enqueued by `POST /api/v1/webhooks/github` upon validating a `pull_request` event. The payload is normalized and flat:

```json
{
  "repositoryId": 123456,
  "repositoryFullName": "owner/repo",
  "pullRequestNumber": 42,
  "installationId": 1234,
  "action": "opened",
  "sender": "username",
  "timestamp": "2026-01-01T00:00:00Z"
}
```

### Workers

The review worker (`src/workers/review.worker.ts`) is started automatically during server boot and runs asynchronously:

- Logs job transitions (`Job received`, `Job completed`, `Job failed`).
- Currently accepts and finishes jobs without executing external AI or Git database writes.

If Redis is unreachable at startup, the server logs the connection error and terminates immediately.

### Review Persistence & History

After successfully publishing the code review to GitHub, the background worker fetches the associated MongoDB repository document.
The AI review findings, metrics, and PR details are persisted into the `Review` collection using the `ReviewService`.
This collection serves as the historical source of truth. If persistence fails, the background worker logs the failure but does not fail the overall BullMQ job, as the GitHub review was already successfully submitted.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm run format
npm run format:check
```

## Request Pipeline

The Express app uses a shared production middleware pipeline:

- Helmet and CORS for baseline HTTP hardening
- Request ID generation with an `X-Request-ID` response header
- Structured request logging with method, URL, status code, response time, IP address, and request ID
- JSON request parsing
- Versioned API routing under `/api/v1`
- Centralized 404 and error handling

Future API endpoints should be added under `src/routes/v1.routes.ts` and should use reusable
middleware such as `asyncHandler()` and `validate()` instead of local try/catch blocks or
controller-level validation.

## Docker

Create a local environment file:

```bash
cp .env.example .env
```

From the project root, build and run the backend container:

```bash
docker compose up --build
```

The Compose setup runs the backend in development mode, mounts the local source code into
the container, keeps container dependencies in a named volume, loads variables from
`backend/.env`, and restarts automatically unless stopped.

## Health Check

Start the development server and request:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "status": "ok"
}
```

The `/health` route is temporarily retained for backward compatibility. New clients should use
`/api/v1/health`.

Unknown routes return standardized JSON errors and include an `X-Request-ID` header for tracing.

## API Documentation

Interactive OpenAPI 3 documentation is served via Swagger UI:

| URL                  | Description           |
| -------------------- | --------------------- |
| `GET /api/docs`      | Swagger UI (browser)  |
| `GET /api/docs.json` | Raw OpenAPI JSON spec |

The documentation covers every public and internal endpoint, including authentication flows, request body schemas, query parameters, error responses, and examples.

All API endpoints under `/api/v1` require cookie-based JWT authentication (the `jwt` HTTP-only cookie set during GitHub OAuth login), with the exception of:

- `GET /api/v1/auth/github`
- `GET /api/v1/auth/github/callback`
- `GET /health`
- `POST /api/v1/webhooks/github` (uses HMAC-SHA256 signature verification instead)

To explore the API documentation locally:

```bash
npm run dev
# then open http://localhost:5000/api/docs
```

## Frontend Integration

For a complete guide on how to build a frontend against this API (including authentication flows, loading order, pagination, and error handling), see the **[Frontend Integration Guide](../docs/FRONTEND_INTEGRATION.md)**.
