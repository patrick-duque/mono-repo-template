import { z } from 'zod';

import { API_URL } from 'utils/constants';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from 'utils/helpers';

const RefreshResponseSchema = z.object({
  data: z.object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1).optional(),
  }),
});

const ErrorBodySchema = z
  .object({ message: z.union([z.string(), z.array(z.string())]) })
  .partial();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type ApiOptions = {
  url: string;
  payload?: unknown;
};

const send = async (
  method: string,
  { url, payload }: ApiOptions,
  accessToken: string | null,
) =>
  fetch(`${API_URL}${url}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

// Rotates the refresh token once; returns null when the session cannot be renewed.
const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) return null;

  const res = await send(
    'POST',
    {
      url: '/api/v1/auth/refresh-token',
      payload: { refresh_token: refreshToken },
    },
    null,
  );

  if (!res.ok) return null;

  const { data } = RefreshResponseSchema.parse(await res.json());

  await saveAuthTokens(data);

  return data.access_token;
};

const request = async (method: string, options: ApiOptions) => {
  let res = await send(method, options, await getAccessToken());

  if (res.status === 401 && !options.url.startsWith('/api/public/')) {
    const accessToken = await refreshAccessToken();

    if (accessToken) {
      res = await send(method, options, accessToken);
    } else {
      await clearAuthTokens();
    }
  }

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const { message } = ErrorBodySchema.safeParse(body).data ?? {};

    throw new ApiError(
      res.status,
      (Array.isArray(message) ? message.join(' ') : message) ??
        'Request failed.',
    );
  }

  return body;
};

const Api = {
  get: (options: ApiOptions) => request('GET', options),
  post: (options: ApiOptions) => request('POST', options),
  patch: (options: ApiOptions) => request('PATCH', options),
  delete: (options: ApiOptions) => request('DELETE', options),
};

export default Api;
