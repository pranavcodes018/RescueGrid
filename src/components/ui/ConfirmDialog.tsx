import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center">
      <button
        type="button"
        aria-label="Close confirmation dialog"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-night-950/75 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="panel fade-in relative z-10 w-full max-w-sm p-4"
      >
        <h2 id="confirm-dialog-title" className="text-[14px] font-medium text-mist-50">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
          {description}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button autoFocus variant="secondary" size="sm" onClick={onCancel}>
            Keep current plan
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
