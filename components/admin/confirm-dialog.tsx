'use client'

import { AlertTriangle, Info, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  /** Label for the main button. Defaults to "Confirm". */
  confirmLabel?: string
  /**
   * Label for the secondary button. Leave undefined for a notice with a
   * single "OK" button (used where there's nothing to choose, only something
   * to read -- e.g. a form that needs one more field filled in).
   */
  cancelLabel?: string
  /** 'danger' for anything destructive (delete), 'notice' for a plain heads-up. */
  tone?: 'danger' | 'notice'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * The app's own replacement for window.confirm() / window.alert(). The
 * browser versions are unstyled, can't be themed, and pop up with the
 * site's domain in the title ("kalingapp-admin.vercel.app says...") --
 * this matches the rest of the admin dashboard's modals instead.
 *
 * Renders above the other modals (z-[60]) so it can be opened from inside
 * one -- e.g. confirming a delete from the User Management details panel.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel,
  tone = 'notice',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  const isDanger = tone === 'danger'
  const Icon = isDanger ? AlertTriangle : Info

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-white rounded-[20px] border border-border max-w-md w-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-6">
        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 p-2.5 rounded-xl ${
              isDanger ? 'bg-[#FFDAD9] text-destructive' : 'bg-light-pink text-primary'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {cancelLabel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="px-5 py-2.5 bg-white hover:bg-light-pink border-2 border-primary text-primary rounded-xl transition-all duration-200 disabled:opacity-60"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-5 py-2.5 rounded-xl text-white transition-all duration-200 disabled:opacity-60 flex items-center gap-2 ${
              isDanger ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-[#E05F86]'
            }`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
