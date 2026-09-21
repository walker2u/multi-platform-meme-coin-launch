import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl cursor-pointer active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 border border-indigo-400/20',
      gradient:
        'bg-crypto-gradient hover:opacity-95 text-white shadow-lg shadow-purple-500/25 border border-white/20 font-semibold tracking-wide',
      secondary:
        'bg-surface-light hover:bg-white/10 text-white border border-white/10',
      outline:
        'border border-white/20 hover:border-white/40 hover:bg-white/5 text-white',
      ghost: 'hover:bg-white/5 text-slate-300 hover:text-white',
      danger: 'bg-red-500/90 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
      lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
