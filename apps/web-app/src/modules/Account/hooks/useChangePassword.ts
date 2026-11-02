import { useMutation } from '@tanstack/react-query';

import Api from 'utils/hooks/Api';

import {
  ChangePasswordSchema,
  ProfileResponseSchema,
  type ChangePassword,
  type ProfileResponse,
} from '../dtos';

const api = new Api();

export const useChangePassword = () => {
  return useMutation<ProfileResponse, Error, ChangePassword>({
    mutationFn: async (payload) => {
      const response = await api.patch({
        payload: ChangePasswordSchema.parse(payload),
        url: '/api/v1/auth/profile/change-password',
      });

      return ProfileResponseSchema.parse(response);
    },
  });
};
