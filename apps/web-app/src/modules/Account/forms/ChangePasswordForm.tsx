import { FC, useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

import { Button } from 'ui/components/common';
import { Input, useUnsavedChangesGuard } from 'ui/components/form';
import { SIZE } from 'utils/constants';
import { cn } from 'utils/helpers';

import {
  ChangePasswordSchema,
  type ChangePassword,
  type ProfileResponse,
} from '../dtos';
import { useChangePassword } from '../hooks/useChangePassword';

type ApiErrorData = {
  message?: string | string[];
};

type ApiError = {
  data?: ApiErrorData;
  message?: string | string[];
};

const defaultValues: ChangePassword = {
  old_password: '',
  new_password: '',
  new_password_confirmation: '',
};

const getChangePasswordErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  const message = apiError.data?.message ?? apiError.message;

  if (Array.isArray(message)) return message[0] ?? 'Unable to change password.';
  if (typeof message === 'string') return message;

  return 'Unable to change password. Try again later.';
};

const ChangePasswordForm: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const changePassword = useChangePassword();
  const methods = useForm<ChangePassword>({
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(ChangePasswordSchema),
  });
  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = methods;

  const resetForm = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    reset(defaultValues);
  };

  useUnsavedChangesGuard({
    isDirty,
    onDiscard: resetForm,
  });

  useEffect(() => {
    if (isDirty) setSuccessMessage(null);
  }, [isDirty]);

  const onSubmit: SubmitHandler<ChangePassword> = async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response: ProfileResponse = await changePassword.mutateAsync(
        values,
      );

      reset(defaultValues);
      setSuccessMessage(response.message ?? 'Password changed successfully.');
    } catch (error) {
      setErrorMessage(getChangePasswordErrorMessage(error));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            autoComplete="current-password"
            label="Current password"
            name="old_password"
            required
            size={SIZE.Medium}
            type="password"
          />
          <Input
            autoComplete="new-password"
            label="New password"
            name="new_password"
            required
            size={SIZE.Medium}
            type="password"
          />
          <Input
            autoComplete="new-password"
            label="Retype new password"
            name="new_password_confirmation"
            required
            size={SIZE.Medium}
            type="password"
          />
        </div>

        {errorMessage && (
          <p
            className={cn(
              'rounded-md border border-danger-light bg-danger-light/10',
              'px-3 py-2 text-sm text-danger-dark',
            )}
          >
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p
            className={cn(
              'rounded-md border border-success-light bg-success-light/20',
              'px-3 py-2 text-sm text-success-dark',
            )}
          >
            {successMessage}
          </p>
        )}

        {isDirty && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              className="min-h-11 rounded-md"
              disabled={changePassword.isPending}
              intent="tertiary"
              label={
                <span className="inline-flex items-center gap-2">
                  <HiOutlineX className="h-4 w-4" />
                  Cancel changes
                </span>
              }
              onClick={resetForm}
              type="button"
            />
            <Button
              className="min-h-11 rounded-md"
              disabled={changePassword.isPending}
              label={
                <span className="inline-flex items-center gap-2">
                  <HiOutlineCheck className="h-4 w-4" />
                  {changePassword.isPending ? 'Saving...' : 'Save password'}
                </span>
              }
              type="submit"
            />
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default ChangePasswordForm;
