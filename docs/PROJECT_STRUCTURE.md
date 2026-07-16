# PROJECT_STRUCTURE.md

# AI-Powered Code Review & Mentorship Platform

This document defines the expected folder structure for the backend application.

All new code should follow this structure unless explicitly instructed otherwise.

---

# Project Structure

```text
backend/
│
├── src/
│   │
│   ├── app.ts                 # Express application
│   ├── server.ts              # Server entry point
│   │
│   ├── config/                # Application configuration
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   └── index.ts
│   │
│   ├── controllers/           # HTTP controllers
│   │
│   ├── services/              # Business logic
│   │
│   ├── repositories/          # Database access layer
│   │
│   ├── models/                # Mongoose models
│   │
│   ├── routes/                # Express routes
│   │
│   ├── middleware/
│   │   ├── auth/
│   │   ├── validation/
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   │
│   ├── validators/            # Zod schemas
│   │
│   ├── jobs/                  # BullMQ workers
│   │
│   ├── queue/                 # Queue configuration
│   │
│   ├── github/                # GitHub integration
│   │
│   ├── ai/
│   │   ├── prompts/
│   │   ├── embeddings/
│   │   ├── rag/
│   │   └── review/
│   │
│   ├── parsers/
│   │   ├── diff/
│   │   ├── eslint/
│   │   └── treeSitter/
│   │
│   ├── socket/
│   │
│   ├── database/
│   │
│   ├── types/
│   │
│   ├── constants/
│   │
│   ├── errors/
│   │
│   ├── utils/
│   │
│   └── tests/
│
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

---

# Folder Responsibilities

## config/

Contains application configuration.

Responsibilities:

* Environment variables
* Logger
* Application settings

No business logic should exist here.

---

## controllers/

Controllers receive HTTP requests.

Responsibilities:

* Read request data
* Validate input
* Call services
* Return HTTP responses

Controllers should never contain business logic.

---

## services/

Contains business logic.

Services may:

* Call repositories
* Call AI services
* Call GitHub services
* Call queues

Services should not know about Express request or response objects.

---

## repositories/

Responsible for all database operations.

Responsibilities:

* Create
* Read
* Update
* Delete

Database queries should never appear inside controllers.

---

## models/

Contains database models and schemas.

Each collection should have its own model.

---

## routes/

Defines API endpoints.

Routes should only map endpoints to controllers.

---

## middleware/

Contains reusable Express middleware.

Examples:

* Authentication
* Validation
* Error handling
* Request logging

---

## validators/

Contains Zod schemas.

Every request body, query parameter, route parameter, and environment variable should be validated here.

---

## jobs/

Contains BullMQ worker implementations.

Workers process background jobs independently of HTTP requests.

---

## queue/

Contains BullMQ configuration.

Responsibilities:

* Queue creation
* Queue connection
* Queue utilities

---

## github/

Contains all GitHub-related functionality.

Examples:

* OAuth
* Webhooks
* Pull Requests
* Repository APIs
* Inline Comments

No GitHub logic should exist outside this folder.

---

## ai/

Contains all AI-related functionality.

Subfolders:

* prompts
* embeddings
* rag
* review

Only this folder may communicate with AI providers.

---

## parsers/

Responsible for code analysis.

Includes:

* Diff parser
* ESLint runner
* tree-sitter parser

---

## socket/

Contains Socket.io configuration and event handlers.

---

## database/

Contains MongoDB connection setup.

No models should be defined here.

---

## types/

Contains shared TypeScript types and interfaces.

Avoid duplicate type definitions.

---

## constants/

Contains shared constants and enums.

Avoid hardcoding strings throughout the application.

---

## errors/

Contains custom error classes.

Examples:

* ValidationError
* AuthenticationError
* NotFoundError
* GitHubError

---

## utils/

Contains reusable helper functions.

Utilities should be framework-independent whenever possible.

---

## tests/

Contains automated tests.

Recommended structure:

* Unit tests
* Integration tests
* Mock utilities

---

# Architecture Principles

The project follows a layered architecture.

```text
HTTP Request

↓

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Database
```

AI integrations follow:

```text
Service

↓

AI Module

↓

Gemini

↓

Response
```

Background processing follows:

```text
Webhook

↓

BullMQ Queue

↓

Worker

↓

Review Service
```

---

# Dependency Rules

Controllers may use:

* Services

Services may use:

* Repositories
* AI
* GitHub
* Queue
* Utilities

Repositories may use:

* Models

Models should not depend on any application layer.

Utilities should not depend on Express.

---

# Naming Conventions

Folders:

* lowercase

Files:

* kebab-case

Classes:

* PascalCase

Functions:

* camelCase

Constants:

* UPPER_SNAKE_CASE

Interfaces:

* PascalCase

Enums:

* PascalCase

---

# Future Expansion

This structure is designed to support future features including:

* Multiple AI providers
* Team workspaces
* Organization dashboards
* Notifications
* Plugin system
* Enterprise features

New features should integrate into the existing architecture instead of creating parallel folder structures.

