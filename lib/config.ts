export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const AUTH_BASE_URL =
  (process.env.BASE_API_URL as string | undefined) || API_BASE_URL;

