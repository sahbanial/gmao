import { useState } from "react";
import { Icon } from "../../shared/ui/icon";

const INPUT_CLASS =
  "h-12 w-full rounded-lg border-2 border-outline bg-surface-container-lowest py-0 pl-12 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary-container";

interface LoginFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: "email" | "password";
  readonly value: string;
  readonly autoComplete: string;
  readonly icon: string;
  readonly hasError: boolean;
  readonly onChange: (value: string) => void;
}

export function LoginField({
  id,
  label,
  type,
  value,
  autoComplete,
  icon,
  hasError,
  onChange,
}: LoginFieldProps) {
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && isSecretVisible ? "text" : type;

  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <label className="text-body-sm font-semibold text-on-surface-variant" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute top-1/2 left-sm -translate-y-1/2 text-on-surface-variant"
          filled={false}
          name={icon}
        />
        <input
          aria-invalid={hasError}
          autoComplete={autoComplete}
          className={`${INPUT_CLASS} ${isPassword ? "pr-12" : "pr-4"} ${hasError ? "border-error focus:border-error focus:ring-error-container" : ""}`}
          id={id}
          inputMode={type === "email" ? "email" : undefined}
          name={id}
          onChange={(event) => onChange(event.target.value)}
          required
          type={inputType}
          value={value}
        />
        {isPassword ? (
          <button
            aria-label={isSecretVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute top-1/2 right-xs flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container active:bg-surface-container-high"
            onClick={() => setIsSecretVisible((visible) => !visible)}
            type="button"
          >
            <Icon filled={false} name={isSecretVisible ? "visibility_off" : "visibility"} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
