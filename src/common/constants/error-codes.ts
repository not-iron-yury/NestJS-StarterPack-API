export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED', // 401 Unauthorized

  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS', //  403 Forbidden

  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS', // 429 Too Many Requests

  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR', // 500 Internal Server Error
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
