# Frontend Integration Guide

> **Audience:** React developers building the AI Code Review Platform frontend.
> **Backend version:** v1.0.0
> **Base URL:** `http://localhost:5000` (local dev) · configure via `VITE_API_URL` or similar

Reference documents:

- [Swagger UI](http://localhost:5000/api/docs) — interactive API explorer
- [OpenAPI JSON](http://localhost:5000/api/docs.json) — machine-readable spec
- [Postman Collection](./postman/README.md) — ready-to-import requests

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Cookie Authentication](#3-cookie-authentication)
4. [Dashboard Loading Order](#4-dashboard-loading-order)
5. [Repository Workflow](#5-repository-workflow)
6. [AI Review Lifecycle](#6-ai-review-lifecycle)
7. [Pagination](#7-pagination)
8. [Error Handling](#8-error-handling)
9. [Loading States](#9-loading-states)
10. [Recommended React Structure](#10-recommended-react-structure)
11. [API Usage Table](#11-api-usage-table)
12. [Integration Checklist](#12-integration-checklist)

---

## 1. Project Overview

The platform has six functional areas. Each maps to a set of API endpoints.

| Area | What it does | Key endpoints |
|------|-------------|---------------|
| **Authentication** | GitHub OAuth login, session management | `/auth/github`, `/auth/me`, `/auth/logout` |
| **Repositories** | Sync GitHub repos, connect/disconnect for reviews | `/repositories`, `/repositories/sync` |
| **Dashboard** | High-level metrics and review trend charts | `/dashboard`, `/statistics` |
| **AI Review Flow** | Fully automated — triggered by GitHub webhooks, no frontend action needed | Webhook-only |
| **Review History** | Browse past AI-generated code reviews | `/reviews`, `/reviews/:id` |
| **Settings** | Per-repository AI review configuration | `/repositories/:id/settings` |

### What the frontend does NOT trigger

The AI review pipeline is entirely backend-driven:

- A GitHub PR triggers a webhook → the backend queues and processes the review automatically
- The frontend only **reads** completed reviews; it never starts them
- There is no "run review now" button in this version

---

## 2. Authentication Flow

The platform uses **GitHub OAuth 2.0** with server-side session management via HTTP-only cookies.

### Sequence Diagram

```
User                  Frontend              Backend               GitHub
 │                       │                     │                     │
 │  Click "Login"         │                     │                     │
 ├──────────────────────►│                     │                     │
 │                       │  redirect browser   │                     │
 │                       ├────────────────────►│                     │
 │                       │  GET /auth/github   │                     │
 │                       │                     │  302 → GitHub OAuth │
 │                       │                     ├────────────────────►│
 │                       │                     │                     │
 │                       │                     │  code + state       │
 │                       │                     │◄────────────────────┤
 │                       │                     │                     │
 │                       │                     │  exchange code      │
 │                       │                     │  fetch user profile │
 │                       │                     │  set JWT cookie     │
 │                       │                     │  302 → /dashboard   │
 │                       │◄────────────────────┤                     │
 │                       │                     │                     │
 │                       │  GET /auth/me       │                     │
 │                       ├────────────────────►│                     │
 │                       │  { user data }      │                     │
 │                       │◄────────────────────┤                     │
 │◄──────────────────────┤                     │                     │
 │  Dashboard loaded      │                     │                     │
```

### Implementation Steps

**Step 1 — Initiate login**

Do not call this with `fetch`. Navigate the browser window to the OAuth endpoint so GitHub can set its own cookies:

```js
// Correct — navigates the browser
window.location.href = 'http://localhost:5000/api/v1/auth/github';

// Wrong — fetch cannot follow OAuth redirects
fetch('/api/v1/auth/github'); // ❌
```

**Step 2 — Handle the callback redirect**

The backend redirects to `CLIENT_URL/dashboard` on success, or `CLIENT_URL/login?error=github_auth_failed` on failure.

Configure `CLIENT_URL` in the backend `.env`:

```env
CLIENT_URL=http://localhost:3000
```

Your frontend router must handle both destinations:

```
/dashboard    → load user session, show dashboard
/login        → show login page; read ?error query param for error messages
```

**Step 3 — Load the user session**

As soon as the dashboard route mounts, call `/auth/me` to confirm the session is valid and hydrate user state:

```
GET /api/v1/auth/me
Cookie: jwt=<http-only, sent automatically>
```

If this returns `401`, the session has expired — redirect to `/login`.

---

## 3. Cookie Authentication

### How it works

The backend sets two HTTP-only cookies on successful login:

| Cookie | Purpose | Visible to JS |
|--------|---------|--------------|
| `jwt` | Short-lived access token | ❌ No (httpOnly) |
| `refresh_token` | Long-lived refresh token | ❌ No (httpOnly) |

> **Security:** Because cookies are `httpOnly`, JavaScript cannot read them. This prevents XSS attacks from stealing tokens.

### Required fetch configuration

Every API call must include `credentials: 'include'` so the browser sends cookies cross-origin:

```js
// Required for all authenticated API calls
fetch('http://localhost:5000/api/v1/auth/me', {
  credentials: 'include',
});
```

If you use `axios`, set this globally:

```js
axios.defaults.withCredentials = true;
```

### CORS

The backend is configured to accept requests from `CLIENT_URL`. If your frontend runs on a different port during development, make sure `CLIENT_URL` in the backend `.env` matches exactly (including `http://`):

```env
CLIENT_URL=http://localhost:3000
```

### SameSite Policy

Cookies are set with `SameSite=Lax` in development. This means:

- ✅ Cross-origin fetch with `credentials: 'include'` works on the same machine
- ⚠️ If frontend and backend are on different domains in production, `SameSite=None; Secure` is required (handled by backend configuration, not frontend)

### Token Refresh

When the `jwt` cookie expires, the backend returns `401`. The frontend should:

1. Call `POST /api/v1/auth/refresh` to rotate the tokens
2. Retry the failed request once
3. If refresh also returns `401`, clear local state and redirect to `/login`

```
GET /api/v1/repositories    → 401 (jwt expired)
POST /api/v1/auth/refresh   → 200 (new cookies set)
GET /api/v1/repositories    → 200 (retry succeeds)
```

### Logout

```
POST /api/v1/auth/logout
```

The backend clears all auth cookies. On success:

1. Clear all local/session state (user, repositories, reviews)
2. Redirect to `/login`

---

## 4. Dashboard Loading Order

Load in this order to avoid flashing incomplete UI:

```
1. GET /api/v1/auth/me           ← confirm session, get user identity
         │
         ▼ (parallel)
2a. GET /api/v1/dashboard        ← summary metrics
2b. GET /api/v1/repositories     ← sidebar repository list
         │
         ▼ (deferred — only if user navigates to reviews tab)
3. GET /api/v1/reviews           ← paginated review list
4. GET /api/v1/statistics        ← chart data
```

**Why this order?**

- `/auth/me` first — gates all other calls; if it fails, nothing else should load
- `/dashboard` and `/repositories` in parallel — both are needed for the initial dashboard render and are independent
- `/reviews` and `/statistics` deferred — heavier aggregation queries; only needed when the user navigates to those tabs

### Suggested React Query / SWR setup

```
useQuery('user', fetchMe)                    // always-on, drives auth state
useQuery('dashboard', fetchDashboard)        // enabled: !!user
useQuery('repositories', fetchRepositories) // enabled: !!user
useQuery('reviews', fetchReviews)            // enabled: !!user && activeTab === 'reviews'
useQuery('statistics', fetchStatistics)      // enabled: !!user && activeTab === 'statistics'
```

---

## 5. Repository Workflow

### Sync → Connect → Monitor → Disconnect

```
POST /repositories/sync
    │
    ▼
Repositories appear in list (isConnected: false)
    │
    ▼
PATCH /repositories/:id/connect
    │
    ▼
isConnected: true — webhooks now trigger AI reviews
    │
    ▼ (optional)
PATCH /repositories/:id/settings  ← configure review level, model, etc.
    │
    ▼ (GitHub PR opened by any developer)
Review appears in /reviews automatically
    │
    ▼ (optional)
PATCH /repositories/:id/disconnect  ← pause reviews
    │
    ▼ (optional)
DELETE /repositories/:id            ← remove from platform
```

### Key Repository Fields

| Field | Type | Meaning |
|-------|------|---------|
| `isConnected` | `boolean` | Whether the repo receives AI reviews on new PRs |
| `lastSyncedAt` | `date` | When GitHub data was last refreshed |
| `installationId` | `number?` | GitHub App installation ID (set by webhook) |

### Settings Fields

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `true` | Toggle reviews on/off without disconnecting |
| `reviewLevel` | `"standard"` | `light` / `standard` / `strict` — affects prompt depth |
| `maxFiles` | `50` | Skip review if PR touches more files than this |
| `maxPatchCharacters` | `3000` | Truncate per-file diff at this character count |
| `includeSecurity` | `true` | Include security findings |
| `includePerformance` | `true` | Include performance findings |
| `includeMaintainability` | `true` | Include maintainability findings |
| `includeBestPractices` | `true` | Include best practices findings |
| `ignoredPaths` | `[]` | Glob patterns to exclude (e.g. `["*.test.ts"]`) |
| `model` | `"gemini-2.5-flash"` | AI model: `gemini-2.5-flash` or `gemini-2.5-pro` |

---

## 6. AI Review Lifecycle

The review pipeline is fully automated. The frontend is a **read-only observer**.

```
GitHub Developer
      │
      │  Opens / updates a Pull Request
      ▼
GitHub Webhook ──────────────────────────────────────────────────────────────►
                                                                              │
                                              POST /api/v1/webhooks/github   │
                                                         │                   │
                                              Signature verified (HMAC-256)  │
                                                         │                   │
                                              BullMQ job enqueued            │
                                                         │                   │
                                              Worker picks up job            │
                                                         │                   │
                                              Fetch PR diff from GitHub      │
                                                         │                   │
                                              Send diff to Gemini AI         │
                                                         │                   │
                                              Receive structured review      │
                                                         │                   │
                                              Post comments to GitHub PR ◄───┘
                                                         │
                                              Persist review to MongoDB
                                                         │
                                                         ▼
                              Frontend: GET /reviews → new review appears
```

### What "status" means in a Review

| `status` | Meaning |
|----------|---------|
| `pending` | Job enqueued, not yet processed |
| `completed` | AI review generated; may not be published to GitHub yet |
| `published` | AI comments posted to GitHub PR |
| `failed` | Processing error — see logs |

> **Note:** The frontend will typically only see `published` reviews since persistence happens after GitHub publishing. `pending` reviews are ephemeral in the worker.

### Review Object Shape

```json
{
  "id": "64f1...",
  "repository": "64f1...",
  "pullRequestNumber": 42,
  "commitSha": "abc123",
  "branch": "feature/my-feature",
  "status": "published",
  "summary": "Good implementation with minor security concerns.",
  "overallScore": 7,
  "findings": [
    {
      "title": "Unsafe input handling",
      "description": "User input passed without sanitization.",
      "severity": "high",
      "confidence": 0.92,
      "category": "security",
      "filename": "src/api/users.ts",
      "line": 84,
      "suggestion": "Validate and sanitize all user inputs."
    }
  ],
  "positives": ["Good test coverage", "Clean error handling"],
  "statistics": {
    "filesReviewed": 5,
    "additions": 120,
    "deletions": 30,
    "findingsCount": 3,
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 0,
    "info": 0
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 7. Pagination

The reviews endpoints support pagination. All paginated responses share the same envelope.

### Request Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | `1` | — | Page number (1-indexed) |
| `limit` | integer | `20` | `100` | Items per page |
| `sort` | string | `newest` | — | `newest` \| `oldest` \| `highestScore` \| `lowestScore` |
| `repository` | string | — | — | Filter by repository MongoDB ObjectId |

### Response Envelope

```json
{
  "success": true,
  "data": {
    "items": [ /* array of Review objects */ ],
    "total": 47,
    "page": 2,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Example — page 2, 10 per page, security-focused sort

```
GET /api/v1/reviews?page=2&limit=10&sort=highestScore&repository=64f1a2b3c4d5e6f7a8b9c0d2
```

### Pagination UI Recommendations

- Use `totalPages` to render page controls
- Use `total` to display "Showing X–Y of Z results"
- Preload the next page when the user is near the bottom (optional)
- Reset to `page=1` when sort or filter changes

---

## 8. Error Handling

All error responses follow the same shape:

```json
{
  "success": false,
  "requestId": "req-abc123",
  "error": {
    "code": "NOT_FOUND",
    "message": "Repository not found",
    "details": []
  }
}
```

### Status Code Reference

| Status | `error.code` | Frontend Action |
|--------|-------------|-----------------|
| `400` | `VALIDATION_ERROR` | Show field-level validation errors from `details` array |
| `401` | `AUTHENTICATION_ERROR` | Session expired → attempt token refresh → if still 401, redirect to `/login` |
| `403` | `AUTHORIZATION_ERROR` | User lacks permission — show "Access denied" message |
| `404` | `NOT_FOUND` | Resource does not exist or belongs to another user — show empty/not-found state |
| `409` | `CONFLICT` | Duplicate resource (e.g. repository already connected) — show "already exists" error |
| `500` | `INTERNAL_SERVER_ERROR` | Backend error — show generic error toast with `requestId` for support |

### Recommended Error Interceptor Pattern

```
On every API response:
  if status === 401:
    try POST /auth/refresh
    if refresh succeeds → retry original request
    if refresh fails   → clear state + redirect to /login
  if status === 403:
    show toast("You don't have permission to do this")
  if status === 404:
    render <NotFound /> component
  if status === 409:
    show toast("This item already exists")
  if status >= 500:
    show toast("Something went wrong — ref: " + error.requestId)
```

---

## 9. Loading States

Every data-fetching surface should handle these four states:

### States and Recommended UI

| State | Description | UI Pattern |
|-------|-------------|------------|
| **Loading** | First fetch in progress | Skeleton loaders — not spinners |
| **Empty** | Fetch succeeded, no data | Illustrated empty state with a call-to-action |
| **Error** | Fetch failed | Inline error message + Retry button |
| **Refreshing** | Refetch while stale data is shown | Subtle top progress bar (keep stale data visible) |

### Review Processing State

Since reviews are created asynchronously by the backend:

- A new PR is opened → no review exists yet
- After ~30–120 seconds (depending on Gemini response time) → review appears in `/reviews`

**Recommendation:** Poll `GET /api/v1/repositories/:id/reviews` every 30 seconds when the user is viewing a repository's review list. If no polling is desired, show a "Refresh" button.

There is no WebSocket or SSE push in this version.

### Empty State Copy Recommendations

| Page | Empty State Message |
|------|-------------------|
| Repositories list | "No repositories synced yet. Click Sync to import your GitHub repositories." |
| Reviews list | "No reviews yet. Connect a repository and open a Pull Request on GitHub to get started." |
| Repository reviews | "No reviews for this repository yet. Open a Pull Request to trigger an AI review." |
| Statistics | "Not enough data yet. Reviews will appear here once your first AI review completes." |

---

## 10. Recommended React Structure

This is a recommendation — not a requirement. Adapt to your team's conventions.

```
src/
├── pages/
│   ├── LoginPage.tsx            # handles OAuth redirect and ?error param
│   ├── DashboardPage.tsx        # summary cards + recent reviews
│   ├── RepositoriesPage.tsx     # list, sync, connect/disconnect
│   ├── RepositoryDetailPage.tsx # single repo + review history + settings
│   ├── ReviewDetailPage.tsx     # full review with findings
│   ├── StatisticsPage.tsx       # charts and trend data
│   └── NotFoundPage.tsx
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── PageWrapper.tsx
│   ├── repositories/
│   │   ├── RepositoryCard.tsx
│   │   ├── RepositoryList.tsx
│   │   └── RepositorySettings.tsx
│   ├── reviews/
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewList.tsx
│   │   ├── FindingItem.tsx
│   │   └── SeverityBadge.tsx
│   └── ui/
│       ├── Skeleton.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       └── Pagination.tsx
│
├── hooks/
│   ├── useAuth.ts               # wraps /auth/me, logout, refresh
│   ├── useRepositories.ts       # list, sync, connect, disconnect
│   ├── useReviews.ts            # list, get, paginate
│   ├── useDashboard.ts          # dashboard + statistics
│   └── useRepositorySettings.ts # get + patch settings
│
├── services/
│   ├── api.ts                   # base fetch wrapper (credentials: include, error handling)
│   ├── auth.service.ts
│   ├── repository.service.ts
│   ├── review.service.ts
│   └── dashboard.service.ts
│
├── types/
│   ├── user.ts
│   ├── repository.ts
│   ├── review.ts
│   ├── dashboard.ts
│   └── api.ts                   # ApiResponse<T>, ApiError, Paginated<T>
│
└── contexts/
    ├── AuthContext.tsx           # user state + login/logout actions
    └── NotificationContext.tsx  # toast/notification system
```

### Key Design Decisions

- **`services/api.ts`** — single place to set `credentials: 'include'`, base URL, and the 401 refresh interceptor. All other services call this.
- **`hooks/`** — wrap React Query (or SWR) calls. Pages use hooks, not services directly.
- **`contexts/AuthContext`** — the single source of truth for the current user. Gates all protected routes.
- **`types/api.ts`** — define `ApiResponse<T>` and `Paginated<T>` generics so every service is typed.

---

## 11. API Usage Table

| Endpoint | Method | Purpose | Auth | Frontend Page |
|----------|--------|---------|------|--------------|
| `/health` | GET | API status | ❌ | Any (connection check) |
| `/health/database` | GET | DB status | ❌ | Admin/health page |
| `/auth/github` | GET | Start OAuth | ❌ | Login page |
| `/auth/github/callback` | GET | OAuth callback | ❌ | Handled by backend |
| `/auth/me` | GET | Load current user | ✅ | All protected pages |
| `/auth/refresh` | POST | Rotate JWT | ✅ | Error interceptor |
| `/auth/logout` | POST | Clear session | ✅ | Navbar / user menu |
| `/dashboard` | GET | Summary metrics | ✅ | Dashboard page |
| `/statistics` | GET | Chart data | ✅ | Statistics page |
| `/repositories` | GET | List user repos | ✅ | Repositories page |
| `/repositories` | POST | Create repo manually | ✅ | Rarely used |
| `/repositories/sync` | POST | Sync from GitHub | ✅ | Repositories page (Sync button) |
| `/repositories/:id` | GET | Repo details | ✅ | Repository detail page |
| `/repositories/:id` | DELETE | Remove repo | ✅ | Repository detail page |
| `/repositories/:id/connect` | PATCH | Enable reviews | ✅ | Repository card |
| `/repositories/:id/disconnect` | PATCH | Disable reviews | ✅ | Repository card |
| `/repositories/:id/settings` | GET | Load AI settings | ✅ | Repository settings panel |
| `/repositories/:id/settings` | PATCH | Save AI settings | ✅ | Repository settings panel |
| `/repositories/:id/reviews` | GET | Repo review history | ✅ | Repository detail page |
| `/reviews` | GET | All review history | ✅ | Reviews list page |
| `/reviews/:id` | GET | Single review | ✅ | Review detail page |
| `/webhooks/github` | POST | GitHub webhook | ⚙️ HMAC | Backend only — never call from frontend |

---

## 12. Integration Checklist

Use this to track frontend integration progress.

### Authentication

- [ ] Login page renders with "Login with GitHub" button
- [ ] Button navigates browser to `GET /api/v1/auth/github` (not fetch)
- [ ] Backend `CLIENT_URL` env var points to frontend origin
- [ ] `/dashboard` route calls `GET /auth/me` on mount and stores user in context
- [ ] `/login?error=github_auth_failed` is handled and shows error message
- [ ] All fetch calls include `credentials: 'include'`
- [ ] 401 responses trigger token refresh before redirecting to login
- [ ] Logout clears state and redirects to `/login`

### Dashboard

- [ ] Dashboard calls `/dashboard` and `/repositories` in parallel after `/auth/me`
- [ ] Summary cards display `totalRepositories`, `connectedRepositories`, `totalReviews`, `averageScore`, `reviewsLast30Days`
- [ ] Empty states are shown when counts are zero
- [ ] Loading skeletons shown during fetch

### Repository Sync

- [ ] "Sync Repositories" button calls `POST /repositories/sync`
- [ ] Synced repositories appear in list with `isConnected: false` initially
- [ ] "Connect" button calls `PATCH /repositories/:id/connect` and updates UI
- [ ] "Disconnect" button calls `PATCH /repositories/:id/disconnect`
- [ ] Repository settings panel loads via `GET /repositories/:id/settings`
- [ ] Settings form submits via `PATCH /repositories/:id/settings` (partial update)
- [ ] All settings fields validated client-side before submitting

### Review History

- [ ] Reviews list paginates correctly using `page`, `limit`, `totalPages`
- [ ] Sort controls (`newest`, `oldest`, `highestScore`, `lowestScore`) update query
- [ ] Repository filter dropdown updates `repository` query param
- [ ] Review detail page shows `findings` with severity badges
- [ ] `overallScore` displayed as a visual indicator (e.g. score out of 10)
- [ ] `statistics` panel shows file counts and severity breakdown
- [ ] `positives` list displayed alongside findings
- [ ] Review status `published` / `failed` shown clearly

### Statistics

- [ ] `/statistics` data feeds chart components
- [ ] `reviewTrend` displayed as a line/bar chart (date on X axis, count on Y axis)
- [ ] `severityCounts` displayed as a donut or bar chart
- [ ] `repositoriesReviewed` shown as a metric card
- [ ] `averageScore` shown as a metric card

### Settings

- [ ] `enabled: false` setting disables reviews without disconnecting the repository
- [ ] `reviewLevel` shown as a radio or select control (`light` / `standard` / `strict`)
- [ ] `model` shown as a select (`gemini-2.5-flash` / `gemini-2.5-pro`)
- [ ] `ignoredPaths` shown as a tag/chip input
- [ ] `maxFiles` and `maxPatchCharacters` shown with their valid ranges

### Logout

- [ ] Logout calls `POST /auth/logout` with `credentials: 'include'`
- [ ] After logout: local state cleared, redirect to `/login`
- [ ] Back button after logout shows login page (protected routes re-check session)

---

## Appendix — TypeScript Types

Paste these into `src/types/` as a starting point:

```typescript
// api.ts
export type ApiSuccess<T> = { success: true; message?: string; data: T };
export type ApiError = { success: false; requestId?: string; error: { code: string; message: string; details?: unknown[] } };
export type Paginated<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number };

// user.ts
export type User = { id: string; githubId: number; username: string; displayName: string; avatarUrl: string; profileUrl: string; email?: string; createdAt: string; updatedAt: string };

// repository.ts
export type AiSettings = { enabled: boolean; reviewLevel: 'light' | 'standard' | 'strict'; maxFiles: number; maxPatchCharacters: number; includeSecurity: boolean; includePerformance: boolean; includeMaintainability: boolean; includeBestPractices: boolean; ignoredPaths: string[]; model: 'gemini-2.5-flash' | 'gemini-2.5-pro' };
export type Repository = { id: string; githubRepositoryId: number; name: string; fullName: string; defaultBranch: string; private: boolean; language?: string; description?: string; cloneUrl: string; htmlUrl: string; installationId?: number; isConnected: boolean; lastSyncedAt?: string; createdAt: string; updatedAt: string };

// review.ts
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Category = 'bug' | 'security' | 'performance' | 'style' | 'maintainability';
export type Finding = { title: string; description: string; severity: Severity; confidence: number; category: Category; filename: string; line?: number; suggestion?: string };
export type ReviewStatistics = { filesReviewed: number; additions: number; deletions: number; findingsCount: number; critical: number; high: number; medium: number; low: number; info: number };
export type Review = { id: string; repository: string; owner: string; githubRepositoryId: number; pullRequestNumber: number; commitSha: string; branch: string; status: 'pending' | 'completed' | 'failed' | 'published'; summary?: string; overallScore?: number; findings: Finding[]; positives: string[]; statistics: ReviewStatistics; createdAt: string; updatedAt: string };

// dashboard.ts
export type DashboardData = { totalRepositories: number; connectedRepositories: number; totalReviews: number; averageScore: number; reviewsLast30Days: number };
export type SeverityCounts = { critical: number; high: number; medium: number; low: number; info: number };
export type ReviewTrendPoint = { date: string; count: number };
export type StatisticsData = { severityCounts: SeverityCounts; averageScore: number; reviewTrend: ReviewTrendPoint[]; repositoriesReviewed: number };
```
