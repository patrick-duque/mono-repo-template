import { FC } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  HiOutlineLogout,
  HiOutlineRefresh,
  HiOutlineUserCircle,
} from 'react-icons/hi';

import { Button, EmptyState, PageHeader } from 'ui/components/common';
import { Container } from 'ui/layouts';
import { AUTH_REMEMBER_ME_STORAGE_KEY } from 'utils/constants';
import { clearAuthCookies } from 'utils/helpers';
import useStorage from 'utils/hooks/useStorage';
import { useProvider } from 'utils/providers';

import {
  AccountSkeleton,
  ActivityDetails,
  ChangePasswordDetails,
  ProfileDetails,
  ProfileSummary,
} from '../components';
import { useGetProfile } from '../hooks/useGetProfile';

const Account: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuthenticated = useProvider((state) => state.setAuthenticated);
  const { removeItem } = useStorage();
  const { data, error, isError, isLoading, refetch } = useGetProfile();

  const handleLogout = () => {
    clearAuthCookies();
    removeItem(AUTH_REMEMBER_ME_STORAGE_KEY);
    queryClient.clear();
    setAuthenticated(false);
    void navigate({ to: '/' });
  };

  if (isLoading) {
    return <AccountSkeleton />;
  }

  if (isError) {
    return (
      <Container className="flex flex-col items-center gap-4">
        <EmptyState
          icon={<HiOutlineRefresh className="h-6 w-6" />}
          title="Unable to load account"
          description={error.message || 'Refresh the page or try again later.'}
          className="min-h-[300px]"
        />
        <Button
          type="button"
          intent="primary"
          label="Retry"
          onClick={() => void refetch()}
        />
      </Container>
    );
  }

  if (!data?.data) {
    return (
      <Container>
        <EmptyState
          icon={<HiOutlineUserCircle className="h-6 w-6" />}
          title="No profile found"
          description="The account profile response did not include user details."
          className="min-h-[360px]"
        />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6">
      <PageHeader
        title="Account"
        description="Your White Label Studio profile and access details."
        action={
          <Button
            type="button"
            intent="tertiary"
            label={
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <HiOutlineLogout className="h-4 w-4" />
                Logout
              </span>
            }
            onClick={handleLogout}
          />
        }
      />
      <ProfileSummary profile={data.data} />
      <ProfileDetails profile={data.data} />
      <ChangePasswordDetails />
      <ActivityDetails profile={data.data} />
    </Container>
  );
};

export default Account;
