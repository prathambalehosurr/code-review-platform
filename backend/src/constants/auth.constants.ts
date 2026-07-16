export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  GITHUB_ACCESS_TOKEN: 'github_access_token',
} as const;

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

export const AUTH_PROVIDER = {
  GITHUB: 'github',
} as const;
