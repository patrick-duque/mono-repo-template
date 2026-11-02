import { useEffect } from 'react';

import type { FieldValues, SubmitHandler } from 'react-hook-form';

import { APP_TITLE, AUTH_REMEMBER_ME_STORAGE_KEY } from 'utils/constants';
import {
  clearAuthCookies,
  cn,
  getRefreshTokenCookie,
  saveAuthCookies,
} from 'utils/helpers';
import useStorage from 'utils/hooks/useStorage';
import { useProvider } from 'utils/providers/Provider';

import { type LoginFormValues } from '../dtos';
import { LoginForm, getLoginErrorMessage } from '../forms';
import { useLogin } from '../hooks/useLogin';
import { useRefreshToken } from '../hooks/useRefreshToken';

const loginCardClasses = [
  'w-full rounded-xl border border-separator-primary',
  'bg-card-primary p-6 shadow-[0_20px_60px_rgb(0_0_0_/_0.12)] sm:p-8',
].join(' ');

const Login = () => {
  const setAuthenticated = useProvider((state) => state.setAuthenticated);
  const { getItem, removeItem, setItem } = useStorage();
  const login = useLogin();
  const { isPending: isRefreshingToken, mutate: refreshAccessToken } =
    useRefreshToken();

  useEffect(() => {
    const shouldRemember = getItem(AUTH_REMEMBER_ME_STORAGE_KEY) === 'true';
    const storedRefreshToken = getRefreshTokenCookie();

    if (!shouldRemember || !storedRefreshToken) return;

    refreshAccessToken(
      { refresh_token: storedRefreshToken },
      {
        onError: () => {
          clearAuthCookies();
          removeItem(AUTH_REMEMBER_ME_STORAGE_KEY);
          setAuthenticated(false);
        },
        onSuccess: ({ data }) => {
          saveAuthCookies({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            rememberMe: true,
          });
          setAuthenticated(true);
          setItem(AUTH_REMEMBER_ME_STORAGE_KEY, 'true');
        },
      },
    );
  }, [getItem, refreshAccessToken, removeItem, setAuthenticated, setItem]);

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    const payload = values as LoginFormValues;
    const rememberMe = payload.remember_me === true;

    login.mutate(payload, {
      onSuccess: ({ data }) => {
        saveAuthCookies({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          rememberMe,
        });
        setItem(AUTH_REMEMBER_ME_STORAGE_KEY, String(rememberMe));
        setAuthenticated(true);
      },
    });
  };

  return (
    <main className="min-h-screen bg-card-secondary px-4 py-6 text-title sm:py-10">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center">
        <div className={loginCardClasses}>
          <div className="mb-8 text-center">
            <div
              className={cn(
                'mx-auto grid h-12 w-12 grid-cols-2 gap-0.5',
                'rounded-md bg-primary-base p-1.5',
              )}
            >
              <span className="rounded-full bg-white/90" />
              <span className="rounded-full bg-white/60" />
              <span className="rounded-full bg-white/60" />
              <span className="rounded-full bg-white/90" />
            </div>
            <h1 className="oswald mt-3 text-4xl font-bold text-title">
              {APP_TITLE}
            </h1>
            <p className="mt-3 text-sm leading-6 text-content">
              Sign in to access the starter workspace.
            </p>
          </div>

          <LoginForm
            defaultRememberMe={getItem(AUTH_REMEMBER_ME_STORAGE_KEY) === 'true'}
            errorMessage={
              login.isError ? getLoginErrorMessage(login.error) : null
            }
            isPending={login.isPending}
            isRefreshingToken={isRefreshingToken}
            isSuccess={login.isSuccess}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </main>
  );
};

export default Login;
