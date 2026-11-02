import { useMutation, useQueryClient } from '@tanstack/react-query';

import Api from 'utils/hooks/Api';

import {
  ProfileResponseSchema,
  ProfileUpdateSchema,
  type ProfileResponse,
  type ProfileUpdate,
} from '../dtos';
import { profileQueryKeys } from './useGetProfile';

const api = new Api();

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfileResponse, Error, ProfileUpdate>({
    mutationFn: async (payload) => {
      const response = await api.patch({
        payload: ProfileUpdateSchema.parse(payload),
        url: '/api/v1/auth/profile',
      });

      return ProfileResponseSchema.parse(response);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(profileQueryKeys.detail, response);
    },
  });
};
