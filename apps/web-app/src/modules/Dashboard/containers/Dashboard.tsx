import { FC, ReactNode } from 'react';

import {
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineTemplate,
} from 'react-icons/hi';

import { Container } from 'ui/layouts';
import { cn } from 'utils/helpers';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

const DashboardCard: FC<DashboardCardProps> = ({
  title,
  description,
  icon,
}) => (
  <div
    className={cn(
      'rounded-xl border border-separator-primary bg-card-primary',
      'flex min-h-40 flex-col gap-4 p-5',
    )}
  >
    <span className="grid h-10 w-10 place-items-center rounded-md bg-card-tertiary text-title">
      {icon}
    </span>
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-title">{title}</h2>
      <p className="text-sm leading-6 text-content">{description}</p>
    </div>
  </div>
);

const Dashboard: FC = () => (
  <Container className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-title">Dashboard</h1>
      <p className="text-sm text-content">
        A neutral authenticated landing page for the white-label starter.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <DashboardCard
        title="Auth foundation"
        description="Login, refresh tokens, profile, users, roles, and permission grants are ready to extend."
        icon={<HiOutlineShieldCheck className="h-5 w-5" />}
      />
      <DashboardCard
        title="App shell"
        description="The responsive sidebar, header, theme state, route layout, and shared UI primitives are retained."
        icon={<HiOutlineTemplate className="h-5 w-5" />}
      />
      <DashboardCard
        title="Settings placeholder"
        description="Use the existing module and route conventions when adding product-specific settings."
        icon={<HiOutlineCog className="h-5 w-5" />}
      />
    </div>
  </Container>
);

export default Dashboard;
