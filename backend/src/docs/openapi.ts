import type { OAS3Options } from 'swagger-jsdoc';

export const openApiDefinition: OAS3Options['definition'] = {
  openapi: '3.0.0',
  info: {
    title: 'AI Code Review Platform API',
    version: '1.0.0',
    description: 'REST API documentation for the AI-Powered Code Review & Mentorship Platform.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'jwt',
        description: 'Authentication cookie containing the JWT token.',
      },
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          requestId: { type: 'string', example: 'req-1234' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'INTERNAL_SERVER_ERROR' },
              message: { type: 'string', example: 'An unexpected error occurred' },
              details: { type: 'array', items: {} },
            },
          },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          githubId: { type: 'number' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          avatarUrl: { type: 'string' },
          profileUrl: { type: 'string' },
          email: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RepositorySettings: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          reviewLevel: { type: 'string', enum: ['light', 'standard', 'strict'] },
          maxFiles: { type: 'number' },
          maxPatchCharacters: { type: 'number' },
          includeSecurity: { type: 'boolean' },
          includePerformance: { type: 'boolean' },
          includeMaintainability: { type: 'boolean' },
          includeBestPractices: { type: 'boolean' },
          ignoredPaths: { type: 'array', items: { type: 'string' } },
          model: { type: 'string', enum: ['gemini-2.5-flash', 'gemini-2.5-pro'] },
        },
      },
      Repository: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          githubRepositoryId: { type: 'number' },
          name: { type: 'string' },
          fullName: { type: 'string' },
          defaultBranch: { type: 'string' },
          private: { type: 'boolean' },
          language: { type: 'string' },
          description: { type: 'string' },
          cloneUrl: { type: 'string' },
          htmlUrl: { type: 'string' },
          installationId: { type: 'number' },
          isConnected: { type: 'boolean' },
          lastSyncedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Finding: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
          confidence: { type: 'number' },
          category: {
            type: 'string',
            enum: ['bug', 'security', 'performance', 'style', 'maintainability'],
          },
          filename: { type: 'string' },
          line: { type: 'number' },
          suggestion: { type: 'string' },
        },
      },
      Statistics: {
        type: 'object',
        properties: {
          filesReviewed: { type: 'number' },
          additions: { type: 'number' },
          deletions: { type: 'number' },
          findingsCount: { type: 'number' },
          critical: { type: 'number' },
          high: { type: 'number' },
          medium: { type: 'number' },
          low: { type: 'number' },
          info: { type: 'number' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          repository: { type: 'string' },
          owner: { type: 'string' },
          githubRepositoryId: { type: 'number' },
          pullRequestNumber: { type: 'number' },
          commitSha: { type: 'string' },
          branch: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed', 'published'] },
          summary: { type: 'string' },
          overallScore: { type: 'number' },
          findings: { type: 'array', items: { $ref: '#/components/schemas/Finding' } },
          positives: { type: 'array', items: { type: 'string' } },
          statistics: { $ref: '#/components/schemas/Statistics' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'number' },
          page: { type: 'number' },
          limit: { type: 'number' },
          totalPages: { type: 'number' },
        },
      },
      Dashboard: {
        type: 'object',
        properties: {
          totalRepositories: { type: 'number' },
          connectedRepositories: { type: 'number' },
          totalReviews: { type: 'number' },
          averageScore: { type: 'number' },
          reviewsLast30Days: { type: 'number' },
        },
      },
      DashboardStatistics: {
        type: 'object',
        properties: {
          severityCounts: {
            type: 'object',
            properties: {
              critical: { type: 'number' },
              high: { type: 'number' },
              medium: { type: 'number' },
              low: { type: 'number' },
              info: { type: 'number' },
            },
          },
          averageScore: { type: 'number' },
          reviewTrend: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                count: { type: 'number' },
              },
            },
          },
          repositoriesReviewed: { type: 'number' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
      },
      BadRequest: {
        description: 'Validation or logic error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  tags: [
    { name: 'Health', description: 'API health checks' },
    { name: 'Authentication', description: 'User authentication' },
    { name: 'Repositories', description: 'Repository management' },
    { name: 'Settings', description: 'Repository AI settings' },
    { name: 'Reviews', description: 'Code review history' },
    { name: 'Dashboard', description: 'High-level dashboard statistics' },
    { name: 'Internal', description: 'Internal webhook endpoints' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health',
        description: 'Returns the current status of the API.',
        security: [],
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            status: { type: 'string' },
                            uptime: { type: 'number' },
                            timestamp: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/health/database': {
      get: {
        tags: ['Health'],
        summary: 'Check database health',
        description: 'Returns the current status of the database connection.',
        security: [],
        responses: {
          '200': { description: 'Database is healthy' },
          '503': { description: 'Database is down' },
        },
      },
    },
    '/auth/github': {
      get: {
        tags: ['Authentication'],
        summary: 'Login with GitHub',
        description: 'Initiates the GitHub OAuth2 login flow.',
        security: [],
        responses: {
          '302': { description: 'Redirects to GitHub' },
        },
      },
    },
    '/auth/github/callback': {
      get: {
        tags: ['Authentication'],
        summary: 'GitHub OAuth Callback',
        description: 'Handles the callback from GitHub and sets the authentication cookie.',
        security: [],
        responses: {
          '302': { description: 'Redirects to frontend on success or failure' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        description: 'Clears the authentication cookie.',
        responses: {
          '200': {
            description: 'Successfully logged out',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        description: 'Returns the authenticated user details.',
        responses: {
          '200': {
            description: 'User details',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard statistics',
        description: 'Returns summary metrics for the dashboard.',
        responses: {
          '200': {
            description: 'Dashboard stats',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/Dashboard' } },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/statistics': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get detailed statistics',
        description: 'Returns charts data such as trends and severity distributions.',
        responses: {
          '200': {
            description: 'Detailed statistics',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/DashboardStatistics' } },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List reviews',
        description: 'Returns a paginated list of reviews for the authenticated user.',
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'repository', schema: { type: 'string' } },
          {
            in: 'query',
            name: 'sort',
            schema: {
              type: 'string',
              enum: ['newest', 'oldest', 'highestScore', 'lowestScore'],
              default: 'newest',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated reviews',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          allOf: [
                            { $ref: '#/components/schemas/Pagination' },
                            {
                              type: 'object',
                              properties: {
                                items: {
                                  type: 'array',
                                  items: { $ref: '#/components/schemas/Review' },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get a single review',
        description: 'Retrieves full details for a specific code review by ID.',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Review details',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/Review' } },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/repositories': {
      get: {
        tags: ['Repositories'],
        summary: 'List repositories',
        description: 'Returns all repositories owned by the user.',
        responses: {
          '200': {
            description: 'List of repositories',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/Repository' } },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Repositories'],
        summary: 'Create a repository',
        description: 'Manually add a repository entry.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['githubRepositoryId', 'name', 'fullName', 'cloneUrl', 'htmlUrl'],
                properties: {
                  githubRepositoryId: { type: 'number' },
                  name: { type: 'string' },
                  fullName: { type: 'string' },
                  cloneUrl: { type: 'string' },
                  htmlUrl: { type: 'string' },
                  defaultBranch: { type: 'string' },
                  private: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Repository created',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/Repository' } },
                    },
                  ],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/repositories/sync': {
      post: {
        tags: ['Repositories'],
        summary: 'Sync GitHub repositories',
        description:
          'Fetches the latest repositories from GitHub and syncs them with the local database.',
        responses: {
          '200': {
            description: 'List of synced repositories',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/Repository' } },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/repositories/{id}': {
      get: {
        tags: ['Repositories'],
        summary: 'Get repository details',
        description: 'Returns details for a specific repository.',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Repository details',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/Repository' } },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Repositories'],
        summary: 'Delete repository',
        description: 'Removes the repository from the platform.',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Repository deleted',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/repositories/{id}/connect': {
      patch: {
        tags: ['Repositories'],
        summary: 'Connect repository',
        description:
          'Marks a repository as connected (usually triggering webhook setup in a real scenario).',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Repository connected',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/Repository' } },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/repositories/{id}/disconnect': {
      patch: {
        tags: ['Repositories'],
        summary: 'Disconnect repository',
        description: 'Marks a repository as disconnected.',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Repository disconnected',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/Repository' } },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/repositories/{id}/settings': {
      get: {
        tags: ['Settings'],
        summary: 'Get AI settings',
        description: 'Returns the repository AI review settings.',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Repository settings',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/RepositorySettings' } },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Settings'],
        summary: 'Update AI settings',
        description: 'Partially updates the repository AI review settings.',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RepositorySettings' } },
          },
        },
        responses: {
          '200': {
            description: 'Settings updated',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/RepositorySettings' } },
                    },
                  ],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/repositories/{id}/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List repository reviews',
        description: 'Returns a paginated list of reviews for a specific repository.',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated repository reviews',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          allOf: [
                            { $ref: '#/components/schemas/Pagination' },
                            {
                              type: 'object',
                              properties: {
                                items: {
                                  type: 'array',
                                  items: { $ref: '#/components/schemas/Review' },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/webhooks/github': {
      post: {
        tags: ['Internal'],
        summary: 'GitHub Webhook Receiver',
        description:
          'Endpoint configured on GitHub to receive repository events. Enqueues processing jobs.',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': {
            description: 'Webhook acknowledged',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': {
            description: 'Invalid signature',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
          },
        },
      },
    },
  },
};
