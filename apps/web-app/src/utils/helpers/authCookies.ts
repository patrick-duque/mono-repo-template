import Cookies from 'js-cookie';

import {
  AUTH_ACCESS_TOKEN_STORAGE_KEY,
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
} from 'utils/constants';

const REMEMBERED_TOKEN_COOKIE_DAYS = 30;

const tokenCookieOptions = {
  sameSite: 'lax',
  secure:
    typeof window !== 'undefined' && window.location.protocol === 'https:',
} as const;

type SaveAuthCookiesOptions = {
  accessToken: string;
  refreshToken?: string;
  rememberMe: boolean;
};

export const clearAuthCookies = () => {
  Cookies.remove(AUTH_ACCESS_TOKEN_STORAGE_KEY);
  Cookies.remove(AUTH_REFRESH_TOKEN_STORAGE_KEY);
};

export const getAccessTokenCookie = (): string | undefined => {
  return Cookies.get(AUTH_ACCESS_TOKEN_STORAGE_KEY);
};

export const getRefreshTokenCookie = (): string | undefined => {
  return Cookies.get(AUTH_REFRESH_TOKEN_STORAGE_KEY);
};

export const saveAuthCookies = ({
  accessToken,
  refreshToken,
  rememberMe,
}: SaveAuthCookiesOptions) => {
  const options = rememberMe
    ? { ...tokenCookieOptions, expires: REMEMBERED_TOKEN_COOKIE_DAYS }
    : tokenCookieOptions;

  Cookies.set(AUTH_ACCESS_TOKEN_STORAGE_KEY, accessToken, options);

  if (rememberMe && refreshToken) {
    Cookies.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken, options);
    return;
  }

  Cookies.remove(AUTH_REFRESH_TOKEN_STORAGE_KEY);
};
