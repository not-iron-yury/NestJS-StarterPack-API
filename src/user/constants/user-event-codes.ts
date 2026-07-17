export const USER_EVENT_CODES = {
  PROFILE_UPDATED: 'PROFILE_UPDATED',

  ROLE_UPDATED: 'ROLE_UPDATED',

  STATUS_UPDATED: 'STATUS_UPDATED',
} as const;

export type UserEventCode =
  (typeof USER_EVENT_CODES)[keyof typeof USER_EVENT_CODES];
