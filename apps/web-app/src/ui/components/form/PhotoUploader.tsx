import {
  ChangeEvent,
  DragEvent,
  FC,
  useCallback,
  useId,
  useState,
} from 'react';

import { useFormContext, useWatch } from 'react-hook-form';
import { FaImage, FaTrash, FaUpload } from 'react-icons/fa';

import { Button, Loading } from 'ui/components/common';
import { cn } from 'utils/helpers';

export interface PhotoUploaderProps {
  className?: string;
  disabled?: boolean;
  getPhotoUrl?: (response: unknown) => string;
  height?: string;
  label?: string;
  labelSubText?: string;
  name: string;
  previewHeight?: string;
  previewWidth?: string;
  required?: boolean;
  uploadPhoto: (file: File) => Promise<unknown>;
  width?: string;
}

const getDefaultPhotoUrl = (response: unknown): string => {
  return typeof response === 'string' ? response : '';
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  return 'Photo upload failed.';
};

const isImageFile = (file: File): boolean => file.type.startsWith('image/');

const PhotoUploader: FC<PhotoUploaderProps> = ({
  className,
  disabled = false,
  getPhotoUrl = getDefaultPhotoUrl,
  height,
  label = 'Photo',
  labelSubText = '(Optional)',
  name,
  previewHeight,
  previewWidth,
  required = false,
  uploadPhoto,
  width,
}) => {
  const inputId = useId();
  const {
    formState: { errors, touchedFields },
    register,
    setValue,
  } = useFormContext();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadedPreviewUrl, setLoadedPreviewUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const value = useWatch({ name });
  const registeredField = register(name);
  const fieldError = errors[name];
  const isTouched = touchedFields[name];
  const hasError = (!!fieldError && isTouched) || !!uploadError;
  const photoUrl = typeof value === 'string' ? value : '';
  const previewHeightClassName = previewHeight ?? height ?? 'h-32';
  const previewWidthClassName = previewWidth ?? width ?? 'w-full';
  const previewUrl = photoUrl || undefined;
  const isPhotoLoading = !!previewUrl && loadedPreviewUrl !== previewUrl;
  const isLoading = isUploading || isPhotoLoading;
  const canUpload = !disabled && !isLoading;

  const uploadFile = useCallback(
    async (file?: File) => {
      if (!file || !canUpload) {
        return;
      }

      if (!isImageFile(file)) {
        setUploadError('Drop an image file to upload.');
        return;
      }

      setIsUploading(true);
      setUploadError('');

      try {
        const response = await uploadPhoto(file);
        const nextPhotoUrl = getPhotoUrl(response);

        setLoadedPreviewUrl('');
        setValue(name, nextPhotoUrl, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      } catch (error) {
        setUploadError(getErrorMessage(error));
      } finally {
        setIsUploading(false);
      }
    },
    [canUpload, getPhotoUrl, name, setValue, uploadPhoto],
  );

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canUpload) {
      return;
    }

    setIsDragging(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canUpload) {
      return;
    }

    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    await uploadFile(event.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    setUploadError('');
    setLoadedPreviewUrl('');
    setValue(name, '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div className={cn('space-y-2.5', className)}>
      <input {...registeredField} type="hidden" />
      <div className="flex h-5 items-center justify-between">
        <label htmlFor={inputId}>
          <span className="mr-1 text-sm font-semibold text-title">{label}</span>
          {required ? (
            <span className="text-danger-base">*</span>
          ) : (
            <span className="text-xs font-normal text-content">
              {labelSubText}
            </span>
          )}
        </label>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded border border-separator-primary',
          'bg-card-primary transition',
          previewWidthClassName,
          hasError && 'border-danger-base',
          isDragging &&
            'border-primary-base bg-primary-light/10 ring-2 ring-primary-base/30',
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(event) => void handleDrop(event)}
      >
        <div
          className={cn(
            'relative flex items-center justify-center bg-card-secondary',
            previewHeightClassName,
          )}
        >
          {previewUrl ? (
            <img
              className={cn(
                'h-full w-full object-cover transition-opacity',
                isLoading && 'opacity-50',
              )}
              src={previewUrl}
              onError={() => setLoadedPreviewUrl(previewUrl)}
              onLoad={() => setLoadedPreviewUrl(previewUrl)}
            />
          ) : !isLoading ? (
            <FaImage className="text-3xl text-content" aria-hidden />
          ) : null}
          {isLoading && (
            <div
              className={cn(
                'absolute inset-0',
                'flex items-center justify-center',
                'bg-card-primary/70',
              )}
            >
              <Loading className="h-full min-h-0 text-2xl" />
            </div>
          )}
          {isDragging && !isLoading && (
            <div
              className={cn(
                'absolute inset-0',
                'flex items-center justify-center',
                'bg-card-primary/80 text-sm font-semibold text-title',
              )}
            >
              Drop photo
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <Button
            className="gap-2"
            disabled={disabled || isLoading}
            intent="tertiary"
            label={
              <>
                <FaUpload aria-hidden />
                {isLoading ? 'Loading...' : 'Upload Photo'}
              </>
            }
            size="sm"
            type="button"
            onClick={() => document.getElementById(inputId)?.click()}
          />
          {photoUrl && (
            <Button
              className="gap-2"
              disabled={disabled || isLoading}
              intent="destructive"
              label={
                <>
                  <FaTrash aria-hidden />
                  Remove
                </>
              }
              size="sm"
              type="button"
              onClick={handleRemove}
            />
          )}
          <input
            accept="image/*"
            className="sr-only"
            disabled={disabled || isLoading}
            id={inputId}
            type="file"
            onChange={(event) => void handleUpload(event)}
          />
        </div>
      </div>
      {hasError && (
        <p className="text-xs text-danger-base">
          {uploadError || (fieldError?.message as string)}
        </p>
      )}
    </div>
  );
};

export default PhotoUploader;
