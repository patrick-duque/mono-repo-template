import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

import { Button } from 'ui/components/common';
import {
  Input,
  PhotoUploader,
  useUnsavedChangesGuard,
} from 'ui/components/form';
import { SIZE } from 'utils/constants';
import { cn } from 'utils/helpers';
import { useStorageConfig } from 'utils/hooks';

import {
  ProfileDetailsFormSchema,
  type Profile,
  type ProfileDetailsFormValues,
  type ProfileUpdate,
} from '../dtos';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

interface ProfileFormProps {
  profile: Profile;
}

type ApiErrorData = {
  message?: string | string[];
};

type ApiError = {
  data?: ApiErrorData;
  message?: string | string[];
};

const getStorageUploadErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as {
      error?: string;
      message?: string;
    };

    return data.message ?? data.error ?? 'Photo upload failed.';
  } catch {
    return 'Photo upload failed.';
  }
};

const getProfileUpdateErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  const message = apiError.data?.message ?? apiError.message;

  if (Array.isArray(message)) return message[0] ?? 'Unable to update profile.';
  if (typeof message === 'string') return message;

  return 'Unable to update profile. Try again later.';
};

const getDefaultValues = (profile: Profile): ProfileDetailsFormValues => ({
  avatar_url: profile.avatar_url ?? '',
  email_address: profile.email_address,
  first_name: profile.first_name,
  last_name: profile.last_name,
  role_name: profile.role?.name ?? '',
});

const getDirtyPayload = (
  values: ProfileDetailsFormValues,
  dirtyFields: Partial<Record<keyof ProfileDetailsFormValues, boolean>>,
): ProfileUpdate => {
  const payload: ProfileUpdate = {};

  if (dirtyFields.avatar_url) payload.avatar_url = values.avatar_url;
  if (dirtyFields.email_address) payload.email_address = values.email_address;
  if (dirtyFields.first_name) payload.first_name = values.first_name;
  if (dirtyFields.last_name) payload.last_name = values.last_name;

  return payload;
};

const ProfileForm: FC<ProfileFormProps> = ({ profile }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const updateProfile = useUpdateProfile();
  const { getPublicObjectUrl, getStorageConfig, getUploadKey } =
    useStorageConfig({ bucket: 'images' });
  const defaultValues = useMemo(() => getDefaultValues(profile), [profile]);
  const methods = useForm<ProfileDetailsFormValues>({
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(ProfileDetailsFormSchema),
  });
  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
    reset,
  } = methods;

  const resetForm = () => {
    setErrorMessage(null);
    reset(defaultValues);
  };

  useUnsavedChangesGuard({
    isDirty,
    onDiscard: resetForm,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const uploadProfilePhoto = useCallback(
    async (file: File) => {
      const { storageToken, storageUrl } = getStorageConfig();
      const uploadKey = getUploadKey(file);
      const response = await fetch(`${storageUrl}/${uploadKey}`, {
        body: file,
        headers: {
          apikey: storageToken,
          Authorization: `Bearer ${storageToken}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(await getStorageUploadErrorMessage(response));
      }

      return getPublicObjectUrl(uploadKey);
    },
    [getPublicObjectUrl, getStorageConfig, getUploadKey],
  );

  const onSubmit: SubmitHandler<ProfileDetailsFormValues> = async (values) => {
    setErrorMessage(null);

    const payload = getDirtyPayload(values, dirtyFields);

    if (!Object.keys(payload).length) return;

    try {
      const response = await updateProfile.mutateAsync(payload);

      reset(getDefaultValues(response.data));
    } catch (error) {
      setErrorMessage(getProfileUpdateErrorMessage(error));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div
          className={cn(
            'grid gap-6',
            'md:grid-cols-[15rem_minmax(0,1fr)]',
            'md:items-start',
          )}
        >
          <div className="flex justify-center md:block">
            <PhotoUploader
              className="w-60"
              height="h-60"
              width="w-60"
              label="Avatar"
              name="avatar_url"
              previewWidth="w-60"
              uploadPhoto={uploadProfilePhoto}
            />
          </div>
          <div className="min-w-0 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                autoComplete="given-name"
                label="First name"
                name="first_name"
                required
                size={SIZE.Medium}
              />
              <Input
                autoComplete="family-name"
                label="Last name"
                name="last_name"
                required
                size={SIZE.Medium}
              />
            </div>
            <Input
              autoComplete="email"
              label="Email address"
              name="email_address"
              disabled
              required
              size={SIZE.Medium}
              type="email"
            />
            <Input
              label="Role"
              name="role_name"
              disabled
              required
              size={SIZE.Medium}
            />
          </div>
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

        {isDirty && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              className="min-h-11 rounded-md"
              disabled={updateProfile.isPending}
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
              disabled={updateProfile.isPending}
              label={
                <span className="inline-flex items-center gap-2">
                  <HiOutlineCheck className="h-4 w-4" />
                  {updateProfile.isPending ? 'Saving...' : 'Save changes'}
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

export default ProfileForm;
