import { cx } from 'class-variance-authority';
import type { ClassValue } from 'class-variance-authority/types';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs));

export default cn;
