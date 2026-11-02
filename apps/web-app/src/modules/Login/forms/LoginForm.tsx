import type { FieldValues, SubmitHandler } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { Button } from 'ui/components/common';
import { Form, Input } from 'ui/components/form';
import { SIZE } from 'utils/constants';

import { LoginFormSchema } from '../dtos';

type ApiErrorData = {
  message?: string | string[];
};

type ApiError = {
  data?: ApiErrorData;
  message?: string | string[];
};

// eslint-disable-next-line react-refresh/only-export-components
export const getLoginErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  const message = apiError.data?.message ?? apiError.message;

  if (Array.isArray(message)) return message[0] ?? 'Unable to log in.';
  if (typeof message === 'string') return message;

  return 'Unable to log in. Check your email address and password.';
};

type LoginFormProps = {
  defaultRememberMe: boolean;
  errorMessage: string | null;
  isPending: boolean;
  isRefreshingToken: boolean;
  isSuccess: boolean;
  onSubmit: SubmitHandler<FieldValues>;
};

const alertClasses = {
  danger: [
    'rounded-md border border-danger-light bg-danger-light/10',
    'px-3 py-2 text-sm text-danger-dark',
  ].join(' '),
  success: [
    'rounded-md border border-success-light bg-success-light/20',
    'px-3 py-2 text-sm text-success-dark',
  ].join(' '),
};

const rememberCheckboxInputClasses = [
  'h-4 w-4 cursor-pointer rounded border-separator-tertiary',
  'bg-card-primary text-primary-base checked:border-primary-base',
  'focus:ring-primary-base focus:ring-offset-card-primary',
].join(' ');

const RememberMeCheckbox = () => {
  const { register } = useFormContext();

  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-content">
      <input
        {...register('remember_me')}
        className={rememberCheckboxInputClasses}
        type="checkbox"
      />
      <span>Remember me</span>
    </label>
  );
};

const LoginForm = ({
  defaultRememberMe,
  errorMessage,
  isPending,
  isRefreshingToken,
  isSuccess,
  onSubmit,
}: LoginFormProps) => (
  <Form
    defaultValues={{
      email_address: '',
      password: '',
      remember_me: defaultRememberMe,
    }}
    onSubmit={onSubmit}
    schema={LoginFormSchema}
  >
    <Input
      autoComplete="email"
      label="Email address"
      name="email_address"
      placeholder="you@example.com"
      required
      size={SIZE.Medium}
      type="email"
    />
    <Input
      autoComplete="current-password"
      label="Password"
      name="password"
      placeholder="Enter your password"
      required
      size={SIZE.Medium}
      type="password"
    />
    <RememberMeCheckbox />

    {errorMessage && <p className={alertClasses.danger}>{errorMessage}</p>}

    {isSuccess && <p className={alertClasses.success}>Login successful.</p>}

    <Button
      className="mt-2 min-h-11 w-full rounded-md"
      disabled={isPending || isRefreshingToken}
      label={isPending ? 'Signing in...' : 'Log in'}
      size="md"
      type="submit"
    />
  </Form>
);

export default LoginForm;
