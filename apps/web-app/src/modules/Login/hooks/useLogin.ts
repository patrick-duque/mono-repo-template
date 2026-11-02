import { useMutation } from '@tanstack/react-query';

import Api from 'utils/hooks/Api';

import {
  type LoginFormValues,
  LoginResponseSchema,
  type LoginResponse,
} from '../dtos';

const api = new Api();

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: async (payload) => {
      const response = await api.post({
        url: '/api/public/auth/login',
        payload,
      });

      return LoginResponseSchema.parse(response);
    },
  });
};
