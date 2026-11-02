enum POSITION {
  Center = 'center',
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
}

enum SIZE {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

const APP_TITLE = import.meta.env.VITE_APP_TITLE;
const VITE_APP_PREFIX = import.meta.env.VITE_APP_PREFIX;

const AUTH_ACCESS_TOKEN_STORAGE_KEY = `${VITE_APP_PREFIX}_access_token`;
const AUTH_REFRESH_TOKEN_STORAGE_KEY = `${VITE_APP_PREFIX}_refresh_token`;
const AUTH_REMEMBER_ME_STORAGE_KEY = `${VITE_APP_PREFIX}_remember_me`;
const THEME_STORAGE_KEY = `${VITE_APP_PREFIX}_theme`;

export {
  POSITION,
  SIZE,
  APP_TITLE,
  AUTH_ACCESS_TOKEN_STORAGE_KEY,
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  AUTH_REMEMBER_ME_STORAGE_KEY,
  THEME_STORAGE_KEY,
};
