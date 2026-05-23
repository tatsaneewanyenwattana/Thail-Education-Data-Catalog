import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover disabled:opacity-40",
  secondary:
    "border border-primary-dark bg-transparent text-primary-dark hover:bg-primary-light disabled:opacity-40",
  ghost:
    "bg-transparent text-primary-dark hover:bg-primary-light disabled:opacity-40",
};

export default function Button({
  variant = "primary",
  href,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex min-h-[44px] items-center justify-center rounded-radius-sm px-4 font-sarabun text-label font-medium transition-colors md:min-h-[40px]";

  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
