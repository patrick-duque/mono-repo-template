import { FC, ReactNode } from 'react';

export interface DetailItemProps {
  label: string;
  value: ReactNode;
}

const DetailItem: FC<DetailItemProps> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-xs font-semibold uppercase text-placeholder">
      {label}
    </dt>
    <dd className="mt-2 break-words text-sm font-medium text-title">{value}</dd>
  </div>
);

export default DetailItem;
