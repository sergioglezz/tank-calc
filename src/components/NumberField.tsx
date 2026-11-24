import type { ReactNode } from 'react'
import { digitsOnly } from '../lib/text'

interface NumberFieldProps {
  id: string
  label: string
  /** Shown inside the field, on the right; the label already says it. */
  unit: string
  value: string
  /** Whole numbers: keypad without separator and digits only (CA15, CA16). */
  integer?: boolean
  placeholder?: string
  /** The error to show, or null. */
  error: string | null
  onChange: (value: string) => void
  onBlur: () => void
  /** Extra controls under the field, such as the quick level buttons. */
  children?: ReactNode
}

export function NumberField({
  id,
  label,
  unit,
  value,
  integer = false,
  placeholder,
  error,
  onChange,
  onBlur,
  children,
}: NumberFieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="mt-6">
      <label htmlFor={id} className="block text-lg font-semibold">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type="text"
          inputMode={integer ? 'numeric' : 'decimal'}
          pattern={integer ? '[0-9]*' : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(event) =>
            onChange(
              integer ? digitsOnly(event.target.value) : event.target.value,
            )
          }
          onBlur={onBlur}
          aria-invalid={error === null ? undefined : true}
          aria-describedby={error === null ? undefined : errorId}
          className={`h-14 w-full rounded-2xl border px-4 pr-14 text-2xl placeholder:text-muted focus:ring-2 focus:ring-ink focus:outline-none ${
            error === null
              ? 'border-line bg-card'
              : 'border-danger bg-danger-soft'
          }`}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg text-muted"
        >
          {unit}
        </span>
      </div>
      {error !== null && (
        <p id={errorId} className="mt-2 text-danger">
          {error}
        </p>
      )}
      {children}
    </div>
  )
}
