import { FC } from 'react';

import { HiOutlineCog } from 'react-icons/hi';

import { EmptyState } from 'ui/components/common';
import { Container } from 'ui/layouts';

const Settings: FC = () => (
  <Container className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-title">Settings</h1>
      <p className="text-sm text-content">
        Workspace preferences and account controls will live here.
      </p>
    </div>

    <EmptyState
      icon={<HiOutlineCog className="h-6 w-6" />}
      title="Settings coming soon"
      description="This area is reserved for future workspace settings."
      className="min-h-[360px]"
    />
  </Container>
);

export default Settings;
