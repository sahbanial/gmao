import type { HTMLAttributes } from "react";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  readonly name: string;
  readonly filled?: boolean;
}

export function Icon({ name, className = "", filled = true, style, ...rest }: IconProps) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
      {...rest}
    >
      {name}
    </span>
  );
}
