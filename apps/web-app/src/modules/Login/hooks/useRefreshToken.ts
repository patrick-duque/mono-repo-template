import { useMutation } from '@tanstack/react-query';

import Api from 'utils/hooks/Api';

import { LoginResponseSchema, type LoginResponse } from '../dtos';

const api = new Api();

type RefreshTokenPayload = {
  refresh_token: string;
};

export const useRefreshToken = () => {
  return useMutation<LoginResponse, Error, RefreshTokenPayload>({
    mutationFn: async (payload) => {
      const response = await api.post({
        url: '/api/v1/auth/refresh-token',
        payload,
      });

      return LoginResponseSchema.parse(response);
    },
  });
};
