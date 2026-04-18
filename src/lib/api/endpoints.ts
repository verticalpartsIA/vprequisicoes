export const ENDPOINTS = {
  AUTH: {
    LOGIN: 'login',
  },
  USERS: {
    LIST: 'list_users',
    ADD: 'add_user',
    DELETE: 'delete_user',
  },
  REQUESTS: {
    CREATE: 'create_request',
    LIST: 'list_requests',
    UPDATE_STATUS: 'update_status',
    UPDATE_DETAILS: 'update_details',
    DELETE: 'delete_request',
  },
} as const;
