import { useCallback, useMemo } from 'react';

interface StorageConfigOptions {
  bucket?: string;
  extension?: string;
}

const generateUploadId = () => {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi?.getRandomValues === 'function') {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));

    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join(''),
    ].join('-');
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const getFileExtension = (file?: File) => {
  if (!file) return null;

  const extension = file.name.split('.').pop();

  if (extension && extension !== file.name) {
    return extension.toLowerCase();
  }

  switch (file.type) {
    case 'image/gif':
      return 'gif';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'application/pdf':
      return 'pdf';
    default:
      return null;
  }
};

const useStorageConfig = ({
  bucket = 'images',
  extension = 'jpg',
}: StorageConfigOptions = {}) => {
  const getStorageConfig = useCallback(() => {
    const storageToken = import.meta.env.VITE_APP_STORAGE_TOKEN as
      string | undefined;
    const storageApiUrl = import.meta.env.VITE_APP_STORAGE_API_URL as
      string | undefined;

    if (!storageApiUrl) {
      throw new Error('VITE_APP_STORAGE_API_URL is not configured.');
    }

    if (!storageToken) {
      throw new Error('VITE_APP_STORAGE_TOKEN is not configured.');
    }

    const storageUrl = `${storageApiUrl.replace(
      /\/$/,
      '',
    )}/storage/v1/object/${bucket}`;

    return { storageToken, storageUrl };
  }, [bucket]);

  const getUploadKey = useCallback(
    (file?: File) => {
      const executionId = generateUploadId();
      const configuredExtension = extension.replace(/^\./, '') || 'jpg';
      const normalizedExtension = getFileExtension(file) ?? configuredExtension;

      return `${executionId}-${Date.now()}.${normalizedExtension}`;
    },
    [extension],
  );

  const getPublicObjectUrl = useCallback(
    (uploadKey: string) => {
      const { storageUrl } = getStorageConfig();

      return `${storageUrl}/${encodeURIComponent(uploadKey)}`;
    },
    [getStorageConfig],
  );

  return useMemo(
    () => ({
      getPublicObjectUrl,
      getStorageConfig,
      getUploadKey,
    }),
    [getPublicObjectUrl, getStorageConfig, getUploadKey],
  );
};

export default useStorageConfig;
