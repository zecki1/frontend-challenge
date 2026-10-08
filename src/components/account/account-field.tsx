import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";

export const accountInputClass =
  "h-10 w-full rounded-[3px] border border-[#3f2319] bg-transparent px-[13px] text-[14px] text-kurio-cream outline-none transition-colors placeholder:text-kurio-bronze focus:border-kurio-copper";

export const accountSelectClass = `${accountInputClass} appearance-none pr-9`;

type FieldVariant = "profile" | "wallets" | "password";

export function AccountField({
  label,
  htmlFor,
  required = false,
  hideLabel = false,
  variant = "wallets",
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hideLabel?: boolean;
  variant?: FieldVariant;
  className?: string;
  children: ReactNode;
}) {
  const labelClass =
    variant === "password"
      ? "flex h-[27px] items-start text-[15px] leading-[15px] text-kurio-cream"
      : variant === "profile"
        ? "flex h-[29px] items-center text-[15px] leading-[15px] text-kurio-cream"
        : "flex h-[25px] items-center text-[15px] leading-[15px] text-kurio-cream";

  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>
        <span className={hideLabel ? "sr-only" : undefined}>{label}</span>
        {required ? (
          <span className="text-[22px] text-kurio-coral">*</span>
        ) : null}
      </label>
      <div className={variant === "profile" ? "mt-[10px]" : undefined}>
        {children}
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-kurio-coral" role="alert">
      {message}
    </p>
  );
}

export function AccountPassword({
  id,
  autoComplete,
  className,
  ...props
}: {
  id: string;
  autoComplete: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className={`${accountInputClass} pr-11 ${className ?? ""}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={t("account.passwordToggle")}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-kurio-bronze transition-colors hover:text-kurio-copper"
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden />
        ) : (
          <Eye className="size-5" aria-hidden />
        )}
      </button>
    </div>
  );
}
