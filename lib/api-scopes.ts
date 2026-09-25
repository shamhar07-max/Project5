export const API_SCOPES = ["read:organization", "read:academy", "read:studio", "read:business", "read:jobs", "write:jobs", "read:support", "read:audit"] as const;
export type ApiScope = (typeof API_SCOPES)[number];
