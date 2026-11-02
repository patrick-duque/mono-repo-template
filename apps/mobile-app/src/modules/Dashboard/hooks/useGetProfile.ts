import { useQuery } from '@tanstack/react-query';

import Api from 'utils/hooks/Api';

import { ProfileResponseSchema, type ProfileResponse } from '../dtos';

export const profileQueryKeys = {
  detail: ['profile'] as const,
};

export const useGetProfile = () => {
  return useQuery<ProfileResponse, Error>({
    queryFn: async () => {
      const response = await Api.get({
        url: '/api/v1/auth/profile',
      });

      return ProfileResponseSchema.parse(response);
    },
    queryKey: profileQueryKeys.detail,
  });
};
