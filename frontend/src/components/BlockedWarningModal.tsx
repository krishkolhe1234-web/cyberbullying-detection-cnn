import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Send, X, ShieldAlert } from 'lucide-react';
import type { BlockedWarning } from '../types';

interface BlockedWarningModalProps {
  warning: BlockedWarning | null;
  onClose: () => void;
  onResend: (newText: string) => void;
}

export const BlockedWarningModal: React.FC<BlockedWarningModalProps> = ({
  warning,
  onClose,
  onResend,
}) => {
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (warning) {
      setEditText(warning.original_text);
    }
  }, [warning]);

  if (!warning) return null;

  const handleSendCorrected = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim()) {
      onResend(editText.trim());
      onClose();
    }
  };

  const confidencePct = (warning.confidence * 100).toFixed(1);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content warning-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="warning-header">
          <div className="warning-icon-badge">
            <AlertOctagon size={42} className="warning-icon" />
          </div>
          <h2 className="warning-title">STOP BULLYING!</h2>
          <p className="warning-subtitle">
            Your message may contain cyberbullying or abusive language. It was blocked from being sent.
          </p>
        </div>

        <div className="warning-details">
          <div className="confidence-chip">
            <ShieldAlert size={16} />
            <span>AI Abuse Confidence: <strong>{confidencePct}%</strong></span>
          </div>
          {warning.cleaned_text && (
            <div className="cleaned-preview">
              <span className="cleaned-label">Preprocessed Tokens:</span>
              <code>{warning.cleaned_text}</code>
            </div>
          )}
        </div>

        <form onSubmit={handleSendCorrected} className="correction-form">
          <label htmlFor="corrected-message" className="form-label">
            Edit your message to make it constructive and respectful:
          </label>
          <textarea
            id="corrected-message"
            className="edit-textarea"
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Rephrase your message politely..."
            autoFocus
          />

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Discard Message
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!editText.trim()}
            >
              <Send size={16} />
              <span>Correct & Re-send</span>
            </button>
          </div>
        </form>

        <div className="privacy-note">
          <CheckCircle2 size={14} className="privacy-icon" />
          <span>This notification is private to you. No one else in the room saw your message.</span>
        </div>
      </div>
    </div>
  );
};
