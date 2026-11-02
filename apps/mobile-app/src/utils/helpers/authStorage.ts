import * as SecureStore from 'expo-secure-store';

import {
  AUTH_ACCESS_TOKEN_STORAGE_KEY,
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
} from 'utils/constants';

export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
};

export const getAccessToken = () =>
  SecureStore.getItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY);

export const getRefreshToken = () =>
  SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_STORAGE_KEY);

export const saveAuthTokens = async ({
  access_token,
  refresh_token,
}: AuthTokens) => {
  await SecureStore.setItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY, access_token);

  if (refresh_token) {
    await SecureStore.setItemAsync(
      AUTH_REFRESH_TOKEN_STORAGE_KEY,
      refresh_token,
    );
  }
};

export const clearAuthTokens = async () => {
  await SecureStore.deleteItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY);
  await SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_STORAGE_KEY);
};
