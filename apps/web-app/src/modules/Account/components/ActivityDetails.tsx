import { FC } from 'react';

import { DetailItem } from 'ui/components/common';

import type { Profile } from '../dtos';
import { formatDateTime } from './accountProfile.utils';
import SectionCard from './SectionCard';

interface ActivityDetailsProps {
  profile: Profile;
}

const ActivityDetails: FC<ActivityDetailsProps> = ({ profile }) => (
  <SectionCard title="Activity">
    <DetailItem
      label="Last login"
      value={formatDateTime(profile.last_login_at)}
    />
    <DetailItem label="Created" value={formatDateTime(profile.created_at)} />
    <DetailItem label="Updated" value={formatDateTime(profile.updated_at)} />
  </SectionCard>
);

export default ActivityDetails;
