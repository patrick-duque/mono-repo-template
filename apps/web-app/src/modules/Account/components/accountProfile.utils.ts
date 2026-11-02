import type { Profile } from '../dtos';

export const formatDateTime = (value: string | null) => {
  if (!value) return 'Not available';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const getInitials = ({ first_name, last_name }: Profile) => {
  return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
};

export const getFullName = ({ first_name, last_name }: Profile) => {
  return `${first_name} ${last_name}`;
};
