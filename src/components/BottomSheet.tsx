import { useEffect, useId, useRef, type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  title: string
  /** Called whenever the sheet closes: Escape, a tap outside or `open` false. */
  onClose: () => void
  children: ReactNode
}

/**
 * A sheet that slides up from the bottom, built on the native modal
 * `<dialog>` (D9): it keeps the focus inside, closes with Escape and gives
 * the focus back to the button that opened it (CA28, CA33).
 */
export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (open && !dialog.open) {
      dialog.showModal()
      // Lets a sheet start on its safest control, e.g. «Cancelar».
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click whose target is the dialog itself is a click on the backdrop:
      // the content fills the dialog, so it never reaches it directly.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="mx-auto mt-auto mb-0 w-full max-w-md rounded-t-3xl bg-card p-0 text-ink backdrop:bg-ink/50"
    >
      {open && (
        <div className="px-5 pt-3 pb-8">
          <div
            aria-hidden="true"
            className="mx-auto h-1.5 w-12 rounded-full bg-line"
          />
          <h2 id={titleId} className="mt-4 text-2xl font-extrabold break-words">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  )
}
