import { ReactNode, useEffect } from 'react';

import { useBlocker } from '@tanstack/react-router';

import { Button } from 'ui/components/common';
import { useModal } from 'ui/partials';

interface UseUnsavedChangesGuardArgs {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: ReactNode;
  isDirty: boolean;
  onDiscard: () => void;
  title?: string;
}

const defaultDescription =
  'You have unsaved changes. Save or discard them before leaving this page.';

const UseUnsavedChangesGuardContent = ({
  cancelLabel,
  confirmLabel,
  description,
  onCancel,
  onConfirm,
}: {
  cancelLabel: string;
  confirmLabel: string;
  description: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <div className="w-full space-y-5 text-left">
    <p className="text-sm leading-6 text-content">{description}</p>
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button
        className="min-h-11 rounded-md"
        intent="tertiary"
        label={cancelLabel}
        onClick={onCancel}
        type="button"
      />
      <Button
        className="min-h-11 rounded-md"
        intent="destructive"
        label={confirmLabel}
        onClick={onConfirm}
        type="button"
      />
    </div>
  </div>
);

const useUnsavedChangesGuard = ({
  cancelLabel = 'Stay on page',
  confirmLabel = 'Discard changes',
  description = defaultDescription,
  isDirty,
  onDiscard,
  title = 'Unsaved changes',
}: UseUnsavedChangesGuardArgs) => {
  const { hideModal, showModal } = useModal();
  const blocker = useBlocker({
    disabled: !isDirty,
    enableBeforeUnload: isDirty,
    shouldBlockFn: () => isDirty,
    withResolver: true,
  });

  useEffect(() => {
    if (blocker.status !== 'blocked') return;

    showModal({
      content: (
        <UseUnsavedChangesGuardContent
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          description={description}
          onCancel={() => {
            hideModal();
            blocker.reset?.();
          }}
          onConfirm={() => {
            onDiscard();
            hideModal();
            blocker.proceed?.();
          }}
        />
      ),
      disableOutsideClick: true,
      size: 'widest',
      title,
    });
  }, [
    blocker,
    cancelLabel,
    confirmLabel,
    description,
    hideModal,
    onDiscard,
    showModal,
    title,
  ]);
};

export default useUnsavedChangesGuard;
