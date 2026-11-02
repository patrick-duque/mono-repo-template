import { FC } from 'react';

import { HiOutlineMail } from 'react-icons/hi';

import { cn } from 'utils/helpers';

import type { Profile } from '../dtos';
import { getFullName, getInitials } from './accountProfile.utils';

interface ProfileSummaryProps {
  profile: Profile;
}

const statusClasses: Record<Profile['status'], string> = {
  ACTIVE: 'border-success-base/30 bg-success-base/10 text-success-dark',
  INACTIVE: 'border-danger-base/30 bg-danger-base/10 text-danger-dark',
  PENDING: 'border-warning-base/30 bg-warning-base/10 text-warning-dark',
};

const ProfileSummary: FC<ProfileSummaryProps> = ({ profile }) => {
  const fullName = getFullName(profile);

  return (
    <section
      className={cn(
        'rounded-xl border border-separator-primary bg-card-primary p-5',
        'shadow-sm',
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div
          className={cn(
            'flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden',
            'rounded-xl bg-primary-base text-2xl font-semibold text-fill-primary',
          )}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`${fullName} avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(profile)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold text-title">
                {fullName}
              </h2>
              <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-content">
                <HiOutlineMail className="h-4 w-4 shrink-0" />
                <span className="break-all">{profile.email_address}</span>
              </div>
            </div>

            <span
              className={cn(
                'inline-flex w-fit items-center rounded-full border px-3 py-1',
                'text-xs font-semibold uppercase',
                statusClasses[profile.status],
              )}
            >
              {profile.status.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSummary;
