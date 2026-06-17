import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

/**
 * A labelled text input. The label is programmatically associated with the
 * input (via a generated id) so screen readers announce it, and an optional
 * hint is linked with aria-describedby.
 */
export function TextField({
  label,
  hint,
  className,
  ...props
}: { label: string; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`input ${className ?? ""}`}
        aria-describedby={hintId}
        {...props}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

/** A labelled <select>, associated the same way as TextField. */
export function SelectField({
  label,
  className,
  children,
  ...props
}: { label: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className={`input ${className ?? ""}`} {...props}>
        {children}
      </select>
    </div>
  );
}
