import { useMutation } from '@tanstack/react-query';

import Api from 'utils/hooks/Api';

import {
  type LoginFormValues,
  LoginResponseSchema,
  type LoginResponse,
} from '../dtos';

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: async (payload) => {
      // Mobile sessions always request a refresh token so users stay signed in.
      const response = await Api.post({
        url: '/api/public/auth/login',
        payload: { ...payload, remember_me: true },
      });

      return LoginResponseSchema.parse(response);
    },
  });
};
