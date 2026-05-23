import { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Optisches Akzent des Bestätigen-Buttons. */
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-App-Bestätigungsdialog. Ersetzt window.confirm, das auf manchen
 * mobilen Browsern (vor allem in PWA-/installiert-Kontexten) nicht oder
 * verzögert angezeigt wird. So sieht der Schiedsrichter den Dialog
 * zuverlässig – auch am Handy.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // ESC schließt den Dialog.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="confirm-dialog-title" className="modal-title">
          {title}
        </h2>
        {message && <p className="modal-message">{message}</p>}
        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`modal-btn confirm ${variant}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
