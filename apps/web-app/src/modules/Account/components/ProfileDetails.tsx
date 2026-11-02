import { FC } from 'react';

import { cn } from 'utils/helpers';

import type { Profile } from '../dtos';
import { ProfileForm } from '../forms';

interface ProfileDetailsProps {
  profile: Profile;
}

const ProfileDetails: FC<ProfileDetailsProps> = ({ profile }) => {
  return (
    <section
      className={cn(
        'rounded-xl border border-separator-primary bg-card-primary p-5',
        'shadow-sm',
      )}
    >
      <h2 className="text-base font-semibold text-title">Profile details</h2>
      <div className="pt-5">
        <ProfileForm profile={profile} />
      </div>
    </section>
  );
};

export default ProfileDetails;
