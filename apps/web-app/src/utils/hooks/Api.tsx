import { create, type AxiosRequestConfig } from 'axios';
import queryString, {
  type StringifiableRecord,
  type StringifyOptions,
} from 'query-string';

import { getAccessTokenCookie } from 'utils/helpers';

export const QUERY_OPTIONS = { arrayFormat: 'index' } as StringifyOptions;

const instance = create({
  baseURL: import.meta.env.VITE_APP_END_POINT,
  timeout: 30000,
  headers: {
    Accepts: 'application/json',
    'Content-type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const accessToken = getAccessTokenCookie();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

interface API_OPTIONS {
  url: string;
  payload?: unknown;
  params?: StringifiableRecord;
  options?: AxiosRequestConfig;
  transformer?: (value: unknown) => unknown;
}

interface API_ARGS {
  onError?: (err: unknown) => unknown;
}

type ApiErrorInput = {
  response?: unknown;
  request?: unknown;
  message?: unknown;
};

class Api {
  constructor(args: API_ARGS = {}) {
    this.request = instance;

    this.onError = args?.onError ?? this.onError;

    this.getError = (err: unknown) => {
      const { response, request, message } = err as ApiErrorInput;

      if (response) return response;
      if (request) return request;
      if (message) return message;

      return null;
    };

    this.result = {};
  }

  getError = (err: unknown) => err;
  onError = (err: unknown) => err;
  request = instance;
  result: Record<string, unknown> = {};

  event = async ({ url, params }: API_OPTIONS) => {
    try {
      const query = queryString.stringify(params ?? {}, QUERY_OPTIONS);
      const eventSource = new EventSource(
        `${import.meta.env.VITE_APP_END_POINT}/${url}?${query}`,
      );

      return eventSource;
    } catch (err) {
      const error = this.getError(err);

      this.onError?.(error);

      throw error;
    }
  };

  get = async ({ url, params, transformer, options }: API_OPTIONS) => {
    try {
      const res = await this.request.get(
        `${url}?${queryString.stringify(params ?? {}, QUERY_OPTIONS)}`,
        options,
      );

      return transformer ? transformer(res?.data) : res?.data;
    } catch (err) {
      const error = this.getError(err);

      this.onError?.(error);

      throw error;
    }
  };

  post = async ({
    url,
    payload,
    params,
    transformer,
    options,
  }: API_OPTIONS) => {
    try {
      const res = await this.request.post(
        `${url}?${queryString.stringify(params ?? {}, QUERY_OPTIONS)}`,
        payload,
        options,
      );

      return transformer ? transformer(res?.data) : res?.data;
    } catch (err) {
      const error = this.getError(err);

      this.onError?.(error);

      throw error;
    }
  };

  patch = async ({
    url,
    payload,
    params,
    transformer,
    options,
  }: API_OPTIONS) => {
    try {
      const res = await this.request.patch(
        `${url}?${queryString.stringify(params ?? {}, QUERY_OPTIONS)}`,
        payload,
        options,
      );

      return transformer ? transformer(res?.data) : res?.data;
    } catch (err) {
      const error = this.getError(err);

      this.onError?.(error);

      throw error;
    }
  };

  put = async ({ url, payload, params, transformer, options }: API_OPTIONS) => {
    try {
      const res = await this.request.put(
        `${url}?${queryString.stringify(params ?? {}, QUERY_OPTIONS)}`,
        payload,
        options,
      );

      return transformer ? transformer(res?.data) : res?.data;
    } catch (err) {
      const error = this.getError(err);

      this.onError?.(error);

      throw error;
    }
  };

  delete = async ({
    url,
    payload,
    params,
    transformer,
    options,
  }: API_OPTIONS) => {
    try {
      const res = await this.request.delete(
        `${url}?${queryString.stringify(params ?? {}, QUERY_OPTIONS)}`,
        { data: payload, ...options },
      );

      return transformer ? transformer(res?.data) : res?.data;
    } catch (err) {
      const error = this.getError(err);

      this.onError?.(error);

      throw error;
    }
  };
}

export default Api;
