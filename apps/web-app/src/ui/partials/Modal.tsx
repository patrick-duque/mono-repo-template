import {
  FC,
  Fragment,
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Transition } from '@headlessui/react';
import { cva } from 'class-variance-authority';

import { POSITION, SIZE } from 'utils/constants';
import { cn } from 'utils/helpers';

import { Card } from '../components/common';

const modalClasses = cva(['fixed m-4', 'rounded-md', 'shadow'], {
  variants: {
    size: {
      [SIZE.Small]: ['w-[320px]'],
      [SIZE.Medium]: ['w-[440px]'],
      [SIZE.Large]: ['w-[600px]'],
      xl: ['w-[600px]'],
      widest: ['max-w-[600px]', 'w-full'],
    },
    position: {
      [POSITION.Center]: [],
      [POSITION.Top]: ['top-0'],
      [POSITION.TopRight]: ['top-0 right-0'],
      [POSITION.TopLeft]: ['top-0 left-0'],
      [POSITION.Bottom]: ['bottom-0'],
      [POSITION.BottomRight]: ['bottom-0 right-0'],
      [POSITION.BottomLeft]: ['bottom-0 left-0'],
      [POSITION.Left]: ['left-`0'],
      [POSITION.Right]: ['right-0'],
    },
  },
  defaultVariants: { size: SIZE.Medium, position: POSITION.Center },
});

type ModalSize = SIZE | 'xl' | 'widest';

interface ShowModalArgs {
  content: ReactNode;
  title?: string;
  disableOutsideClick?: boolean;
  onClickOutside?: () => void;
  hideHeader?: boolean;
  size?: ModalSize;
  position?: POSITION;
  closeCallback?: () => void;
  resetPadding?: boolean;
}

interface ModalInterface {
  showModal: (args: ShowModalArgs) => void;
  hideModal: () => void;
  open: boolean;
}

interface ModalWrapperProps {
  content?: ReactNode;
  title?: string;
  isOpen: boolean;
  closeModal: () => void;
  disableOutsideClick?: boolean;
  onClickOutside?: () => void;
  hideHeader?: boolean;
  size?: ModalSize;
  position?: POSITION;
  resetPadding?: boolean;
  className?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ModalContext = createContext<ModalInterface>({
  hideModal: () => {},
  showModal: () => {},
  open: false,
});

export const ModalWrapper: FC<ModalWrapperProps> = ({
  content,
  title,
  isOpen,
  closeModal,
  disableOutsideClick,
  onClickOutside,
  hideHeader,
  size,
  position,
  className,
}) => {
  const handleCloseModal = () => {
    if (disableOutsideClick) {
      return;
    }

    closeModal();
    onClickOutside?.();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <dialog
        open={isOpen}
        className={cn('relative z-99', className)}
        onClose={handleCloseModal}
      >
        <div className="fixed inset-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div
              className={cn(
                'min-h-full',
                'overflow-y-auto',
                'flex items-center justify-center',
                'bg-fill-secondary/50 backdrop-blur-sm',
              )}
            >
              <div className={cn(modalClasses({ size, position }))}>
                {!hideHeader && (
                  <div
                    className={cn(
                      'flex items-center justify-between',
                      'px-4 py-2.5',
                    )}
                  >
                    <div className="text-sm font-semibold leading-5 tracking-[0.06em]">
                      {title}
                    </div>
                  </div>
                )}
                <Card
                  className={cn(
                    'flex flex-col items-center justify-center',
                    'space-y-6 rounded-md px-10',
                  )}
                >
                  {content}
                </Card>
              </div>
            </div>
          </Transition.Child>
        </div>
      </dialog>
    </Transition>
  );
};

const Modal: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSize, setModalSize] = useState<ModalSize>(SIZE.Large);
  const [modalPosition, setModalPosition] = useState<POSITION>(POSITION.Center);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [hideModalHeader, setHideModalHeader] = useState(false);
  const [modalDisableOutsideClick, setDisableOutsideClick] = useState(false);
  const [closeCallback, setCloseCallback] = useState(() => () => {});
  const [resetPadding, setResetPadding] = useState<boolean | undefined>(false);

  const reset = () => {
    setHideModalHeader(false);
    setDisableOutsideClick(false);
    setModalTitle('');
    setModalSize(SIZE.Large);
    setModalPosition(POSITION.Center);
    setModalContent(null);
    setCloseCallback(() => () => {});
  };

  const showModal = useCallback(
    ({
      content,
      title = '',
      disableOutsideClick = false,
      hideHeader = false,
      size = SIZE.Large,
      position = POSITION.Center,
      resetPadding,
      closeCallback = () => {},
    }: ShowModalArgs) => {
      setModalPosition(position);
      setModalTitle(title);
      setModalSize(size);
      setDisableOutsideClick(disableOutsideClick);
      setHideModalHeader(hideHeader);
      setModalContent(content);
      setCloseCallback(() => closeCallback);
      setResetPadding(resetPadding);
    },
    [],
  );

  const hideModal = useCallback(() => {
    setOpen(false);
    closeCallback();

    // reset after transition duration
    setTimeout(reset, 201);
  }, [closeCallback]);

  const value = useMemo(
    () => ({ showModal, hideModal, open }),
    [showModal, hideModal, open],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(!!modalContent);
  }, [modalContent]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <ModalContext.Provider value={value}>
      <ModalWrapper
        disableOutsideClick={modalDisableOutsideClick}
        isOpen={open}
        closeModal={hideModal}
        content={modalContent}
        hideHeader={hideModalHeader}
        title={modalTitle}
        size={modalSize}
        position={modalPosition}
        resetPadding={resetPadding}
      />
      {children}
    </ModalContext.Provider>
  );
};

const useModal = () => useContext(ModalContext);

// eslint-disable-next-line react-refresh/only-export-components
export { useModal };

export default Modal;
