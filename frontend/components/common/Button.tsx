import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className = "", type = "button", ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:outline-neutral-900"
      : "bg-transparent text-neutral-800 hover:bg-neutral-100 focus-visible:outline-neutral-400";
  return <button type={type} className={`${base} ${styles} ${className}`} {...rest} />;
}
