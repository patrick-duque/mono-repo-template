const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const APP_PREFIX = process.env.EXPO_PUBLIC_APP_PREFIX ?? 'white_label';

const AUTH_ACCESS_TOKEN_STORAGE_KEY = `${APP_PREFIX}_access_token`;
const AUTH_REFRESH_TOKEN_STORAGE_KEY = `${APP_PREFIX}_refresh_token`;

export {
  API_URL,
  AUTH_ACCESS_TOKEN_STORAGE_KEY,
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
};
