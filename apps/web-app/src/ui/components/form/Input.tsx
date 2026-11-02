import {
  forwardRef,
  useState,
  Ref,
  InputHTMLAttributes,
  ReactElement,
} from 'react';

import { useFormContext } from 'react-hook-form';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { cva } from 'class-variance-authority';
import type { IconType } from 'react-icons';

import { SIZE } from 'utils/constants';
import { cn } from 'utils/helpers';

export interface PROPS extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  type?: 'text' | 'password' | 'email' | 'number';
  size?: SIZE | 'default';
  textType?: 'default' | 'danger' | 'success' | 'warning';
  label?: string;
  labelSubText?: string;
  subText?: string;
  required?: boolean;
  isAmount?: boolean;
  hideNumberStepper?: boolean;
  addon?: {
    icon: IconType;
    onClick?: () => void;
    tooltip?: string;
    className?: string;
    disabled?: boolean;
  };
  icon?: ReactElement;
  classOverrides?: {
    input?: string | string[];
    subtext?: string | string[];
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const inputClasses = cva(
  [
    'bg-card-primary text-title caret-primary-base',
    'px-2.5 w-full',
    'border text-sm',
    'focus:outline-none',
    'disabled:bg-card-tertiary',
    'disabled:placeholder-disabled disabled:text-disabled',
  ],
  {
    variants: {
      size: {
        default: ['max-h-[36px]', 'py-2 h-9', 'rounded-md'],
        [SIZE.Small]: ['max-h-[36px]', 'px-3 py-2 h-9', 'rounded'],
        [SIZE.Medium]: ['max-h-[44px]', 'p-3 h-[44px]', 'rounded-[6px]'],
        [SIZE.Large]: [
          'max-h-[52px]',
          'px-[14px] py-[18px] h-[52px]',
          'rounded-lg',
          'text-base',
        ],
      },
      textType: {
        default: [
          'placeholder-placeholder',
          'border-separator-tertiary',
          'disabled:border-none',
          'focus:border-primary-base',
        ],
        success: ['border-primary-base', 'focus:border-primary-base'],
        danger: ['border-danger-base', 'focus:border-danger-base'],
        warning: ['border-warning-base', 'focus:border-warning-base'],
      },
    },
    defaultVariants: { size: 'default', textType: 'default' },
  },
);

const subTextClasses = cva(['text-xs'], {
  variants: {
    textType: {
      default: [],
      success: ['text-primary-base'],
      danger: ['text-danger-base'],
      warning: ['text-warning-base'],
    },
    size: {
      default: 'text-xs',
      [SIZE.Small]: 'text-xs',
      [SIZE.Medium]: 'text-xs',
      [SIZE.Large]: 'text-sm',
    },
  },
  defaultVariants: {
    textType: 'default',
  },
});

const Input = forwardRef(
  (
    {
      addon,
      className,
      type = 'text',
      size,
      textType,
      name,
      label,
      labelSubText = '(Optional)',
      subText,
      required = false,
      isAmount = false,
      hideNumberStepper = true,
      icon,
      classOverrides,
      ...props
    }: PROPS,
    ref: Ref<HTMLInputElement>,
  ) => {
    const {
      register,
      formState: { errors, touchedFields },
    } = useFormContext();
    const [showPassword, setShowPassword] = useState(false);
    const fieldRegistration = name ? register(name) : undefined;
    const setInputRef = (node: HTMLInputElement | null) => {
      fieldRegistration?.ref(node);

      if (typeof ref === 'function') {
        ref(node);

        return;
      }

      if (ref) ref.current = node;
    };

    let inputType = type;
    if (type === 'password') {
      inputType = showPassword ? 'text' : 'password';
    }

    const fieldError = name ? errors[name] : undefined;
    const isTouched = name ? touchedFields[name] : false;

    const hasError = !!fieldError && isTouched;

    return (
      <div className={cn('space-y-2.5', className)}>
        {label && (
          <div className="flex items-center justify-between h-5">
            <label htmlFor={name}>
              <span className="mr-1 text-xs text-title font-semibold">
                {label}
              </span>
              {required ? (
                <span className="text-danger-base">*</span>
              ) : (
                <span className="text-xs text-content font-normal">
                  {labelSubText}
                </span>
              )}
            </label>
          </div>
        )}
        <div className="w-full">
          <div className="relative">
            {isAmount && (
              <span className="text-sm font-semibold text-title">$</span>
            )}
            {icon && (
              <div className="h-4 absolute -translate-y-1/2 left-3 top-1/2 text-content">
                {icon}
              </div>
            )}
            <input
              {...fieldRegistration}
              {...props}
              ref={setInputRef}
              type={inputType}
              name={name}
              className={cn(
                inputClasses({
                  size,
                  textType: hasError ? 'danger' : textType,
                }),
                icon && 'pl-10',
                hideNumberStepper &&
                  '[&::-webkit-outer-spin-button]:appearance-none',
                '[&::-webkit-inner-spin-button]:appearance-none',
                classOverrides?.input,
              )}
            />
            {type === 'password' && (
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className={cn(
                  'absolute -translate-y-1/2 right-3 top-1/2',
                  'cursor-pointer text-content hover:text-title',
                  'focus-visible:outline focus-visible:outline-2',
                  'focus-visible:outline-primary-dark',
                )}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </button>
            )}
            {addon && (
              <addon.icon
                {...(addon?.onClick && { role: 'button' })}
                onClick={addon.disabled ? undefined : addon.onClick}
                title={addon.tooltip}
                className={cn(
                  'absolute -translate-y-1/2 right-3 top-1/2 text-content',
                  addon.className,
                  addon.disabled &&
                    'cursor-not-allowed opacity-50 !text-disabled',
                )}
              />
            )}
          </div>
        </div>
        {subText || hasError ? (
          <div
            className={cn(
              subTextClasses({
                textType: hasError ? 'danger' : textType,
                size,
              }),
              classOverrides?.subtext,
            )}
          >
            {hasError ? (fieldError?.message as string) : subText}
          </div>
        ) : null}
      </div>
    );
  },
);

export default Input;
