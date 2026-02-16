import { useEffect, useRef } from 'react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button by default for destructive actions
      setTimeout(() => confirmRef.current?.focus(), 50)
    }
  }, [isOpen])

  const iconBg = variant === 'danger' ? 'bg-red-100' : 'bg-primary-100'
  const iconColor = variant === 'danger' ? 'text-red-600' : 'text-primary-600'
  const confirmBtnClass =
    variant === 'danger'
      ? 'inline-flex items-center justify-center px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold shadow-sm hover:bg-red-700 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/20'
      : 'btn-primary'

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            {variant === 'danger' ? (
              <svg className={`w-6 h-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className={`w-6 h-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button ref={confirmRef} onClick={onConfirm} className={confirmBtnClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
