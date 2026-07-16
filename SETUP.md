# AI Code Review Platform - Setup Guide

Welcome to the AI Code Review Platform! This guide will walk you through setting up the project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Git** (for version control)
- **Node.js** (v20.0.0 or higher recommended)
- **npm** (comes with Node.js)
- **Docker Desktop** (required to run Redis and local MongoDB)
- **MongoDB Atlas** (optional, if you prefer a managed database over local Docker)
- **GitHub OAuth App** (required for authentication)
- **Google Gemini API Key** (required for AI code review functionality)

---

## Clone Repository

Start by cloning the repository to your local machine:

```bash
git clone <repository-url>
cd <repository-folder>
```

---

## Environment Setup

The backend relies on several environment variables. We provide an example file to get you started.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your local `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file in your editor and update the following critical variables:
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: Obtain these by creating an OAuth application in your GitHub Developer Settings. Ensure the callback URL matches your local environment (e.g., `http://localhost:5000/api/v1/auth/github/callback`).
   - `GITHUB_WEBHOOK_SECRET`: A secure random string for GitHub to sign webhook payloads.
   - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`: Secure, long, random strings (at least 32 characters) for signing session tokens.
   - `GEMINI_API_KEY`: Your Google Gemini API key.

> [!WARNING]
> Never commit your `.env` file to version control. It is already included in `.gitignore`, but always be mindful not to accidentally expose your secrets.

---

## Install Dependencies

While still in the `backend/` directory, install the necessary npm packages:

```bash
npm install
```

---

## Running Infrastructure Services

This project requires MongoDB and BullMQ/Redis for processing background AI jobs. You can easily start these dependencies using Docker.

Navigate to the project root and start the containers:

```bash
cd ..
docker-compose up -d
```

> [!TIP]
> Ensure Docker Desktop is running before executing this command. You can verify the containers are running with `docker ps`.

---

## Running the Application

Once your environment is configured and dependencies are running, start the backend development server:

```bash
cd backend
npm run dev
```

The server should start successfully and listen on port `5000` (or whatever `PORT` you configured in your `.env`).

### Verification & Health Checks
You can verify that your backend is up and running correctly by visiting the API health endpoint:
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- **Swagger Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## Additional Commands

Here are some helpful commands for maintaining code quality during development:

- **Build**: `npm run build` (Compiles TypeScript to JavaScript in `/dist`)
- **Lint**: `npm run lint` (Finds structural and styling issues)
- **Format**: `npm run format` (Automatically formats code via Prettier)
- **Test**: `npm run test` (Runs the Vitest test suite)

---

## Troubleshooting

> [!NOTE]
> **Authentication Errors (GitHub OAuth)**
> If you encounter `incorrect_client_credentials` or "Failed to obtain access token" errors, ensure your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` exactly match your GitHub OAuth application settings.

> [!NOTE]
> **Port Conflicts (EADDRINUSE)**
> If the backend fails to start with `EADDRINUSE :::5000`, another process is using port 5000. You can either stop the competing process or change the `PORT` variable in your `.env`.

> [!NOTE]
> **Database Connection Issues**
> If the server fails to connect to MongoDB or Redis, verify that your Docker containers are running. Check the logs using `docker-compose logs -f`.

Happy coding!
Good night my friends <3
