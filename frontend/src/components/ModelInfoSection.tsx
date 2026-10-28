import React from 'react';
import { X, Layers, Cpu, Database, CheckCircle, ShieldAlert } from 'lucide-react';

interface ModelInfoSectionProps {
  onClose: () => void;
}

export const ModelInfoSection: React.FC<ModelInfoSectionProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content info-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="info-modal-header">
          <div className="info-badge">
            <Cpu size={24} />
          </div>
          <div>
            <h2>CyberShield Deep Learning Architecture</h2>
            <p className="subtitle">Technical reference & viva defense guide</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="card-title">
              <Layers size={18} className="card-icon" />
              <h3>Custom 1D CNN Pipeline</h3>
            </div>
            <p>
              Trained from scratch without bloated pretrained transformers (e.g. BERT/RoBERTa), ensuring sub-10ms inference:
            </p>
            <ul className="pipeline-steps">
              <li><strong>Embedding Layer:</strong> 128-dimensional dense representations learned directly from dataset vocabulary.</li>
              <li><strong>Conv1D (128 filters, kernel 5):</strong> N-gram feature detector capturing local multi-word abusive phrases.</li>
              <li><strong>ReLU Activation:</strong> High-efficiency non-linear decision boundary mapping.</li>
              <li><strong>GlobalMaxPooling1D:</strong> Extracts the single strongest abusive signal regardless of its position in the sentence.</li>
              <li><strong>Dense (64 units) + Dropout (0.5):</strong> High-level combination with regularization against overfitting.</li>
              <li><strong>Sigmoid Output:</strong> Calibrated probability $\in [0, 1]$ where $\ge 0.5$ triggers real-time message blocking.</li>
            </ul>
          </div>

          <div className="info-card">
            <div className="card-title">
              <Database size={18} className="card-icon" />
              <h3>Hinglish & Negation Strategy</h3>
            </div>
            <p>
              Standard keyword filters fail on colloquial multilingual abuse. CyberShield features specialized preprocessing:
            </p>
            <div className="pill-container">
              <span className="info-pill">Preserved Negations: not, no, nahi, nahin, mat, na</span>
              <span className="info-pill">Preserved Slurs: Crucial for pattern detection</span>
              <span className="info-pill">Class Weights: Balanced against raw label skew</span>
            </div>
            <div className="callout-box">
              <ShieldAlert size={18} className="callout-icon" />
              <div>
                <strong>Server-Side Interceptor Guarantee:</strong> The frontend is never trusted with moderation decisions. Every message is parsed, vectorized, and classified on the Flask backend prior to room broadcasting.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            <CheckCircle size={16} />
            <span>Got it</span>
          </button>
        </div>
      </div>
    </div>
  );
};
