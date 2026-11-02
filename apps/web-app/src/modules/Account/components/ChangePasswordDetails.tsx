import { FC } from 'react';

import { cn } from 'utils/helpers';

import { ChangePasswordForm } from '../forms';

const ChangePasswordDetails: FC = () => (
  <section
    className={cn(
      'rounded-xl border border-separator-primary bg-card-primary p-5',
      'shadow-sm',
    )}
  >
    <h2 className="text-base font-semibold text-title">Change password</h2>
    <div className="pt-5">
      <ChangePasswordForm />
    </div>
  </section>
);

export default ChangePasswordDetails;
