import React, { forwardRef } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[#e01c1c] text-white shadow-[0_4px_14px_rgba(224,28,28,0.32)] hover:bg-[#c81717] hover:shadow-[0_6px_20px_rgba(224,28,28,0.4)] active:translate-y-[1px]",
  secondary:
    "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 active:translate-y-[1px]",
  ghost:
    "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  outline:
    "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60",
  danger:
    "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20",
  success:
    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
};

const SIZES: Record<Size, string> = {
  xs: "h-7 px-2.5 text-[12px] gap-1.5 rounded-lg",
  sm: "h-9 px-3.5 text-[13px] gap-2 rounded-lg",
  md: "h-11 px-5 text-[14px] gap-2 rounded-xl",
  lg: "h-13 px-7 text-[15px] gap-2.5 rounded-xl",
};

const ICON_SIZE: Record<Size, number> = { xs: 12, sm: 14, md: 16, lg: 18 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon: Icon, iconRight: IconRight, fullWidth, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e01c1c]/60 dark:focus-visible:ring-offset-[#0B1120]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 size={ICON_SIZE[size]} className="animate-spin" />
      ) : (
        Icon && <Icon size={ICON_SIZE[size]} />
      )}
      {children}
      {IconRight && !loading && <IconRight size={ICON_SIZE[size]} />}
    </button>
  );
});
