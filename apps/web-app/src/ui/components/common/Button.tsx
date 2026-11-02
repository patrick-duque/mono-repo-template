import { FC, ReactNode } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from 'utils/helpers';

const buttonClasses = cva(
  [
    'text-sm font-semibold',
    'cursor-pointer',
    'transition',
    'duration-300',
    'flex items-center justify-center',
    'disabled:pointer-events-none',
    'rounded-full',
    'text-title',
  ],
  {
    variants: {
      size: {
        sm: ['max-h-9 px-[18px] py-3 text-xs leading-3'],
        md: ['max-h-[44px] py-[14px] px-[40px] text-sm leading-5'],
        lg: ['max-h-[52px] px-6 py-[18px] text-base'],
      },
      intent: {
        primary: [
          'bg-primary-base text-fill-primary shadow-sm',
          'hover:bg-primary-light',
          'focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-primary-dark focus-visible:outline-offset-2',
          'disabled:bg-disabled disabled:text-content disabled:shadow-none',
        ],
        secondary: [
          'bg-secondary-dark text-fill-tertiary',
          'hover:bg-content',
          'disabled:bg-disabled',
        ],
        tertiary: [
          'outline outline-1',
          'outline-secondary-light text-secondary-dark',
          'bg-transparent',
          'hover:outline-secondary-dark',
          'disabled:outline-secondary-light disabled:text-disabled',
        ],
        quarternary: [
          'bg-secondary-lightest text-secondary-dark',
          'hover:bg-secondary-light',
          'disabled:bg-disabled',
          'disabled:text-fill-tertiary',
        ],
        destructive: [
          'bg-danger-base text-fill-tertiary',
          'hover:bg-danger-dark',
          'disabled:bg-disabled disabled:text-fill-tertiary',
        ],
        text: [
          'text-secondary-dark',
          'hover:text-primary-base',
          'bg-transparent',
          'disabled:text-disabled',
          'p-0',
          'text-left',
        ],
        link: [
          'text-info-base',
          'hover:text-info-dark',
          'bg-transparent',
          'disabled:text-disabled',
          'p-0',
          'text-left',
        ],
      },
    },
    defaultVariants: { intent: 'primary', size: 'sm' },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonClasses> {
  label?: string | ReactNode;
}

const Button: FC<ButtonProps> = ({
  size,
  intent,
  label,
  className,
  ...props
}) => (
  <button
    className={cn(buttonClasses({ size, intent, className }))}
    type="button"
    {...props}
  >
    {label}
  </button>
);

export default Button;
