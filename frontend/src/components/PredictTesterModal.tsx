import React, { useState } from 'react';
import { X, Search, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { predictText } from '../services/api';
import type { PredictionResponse } from '../types';

interface PredictTesterModalProps {
  onClose: () => void;
}

export const PredictTesterModal: React.FC<PredictTesterModalProps> = ({ onClose }) => {
  const [testInput, setTestInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await predictText(testInput.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze text.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Hello everyone, how are you?',
    'You are a stupid piece of shit go to hell',
    'bhai tu kisi kaam ka nahi hai',
    'deepak chahal se bada chutiya nahi dekha',
    'This is not bad at all',
  ];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content tester-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="tester-header">
          <h2>Independent 1D-CNN Prediction Inspector</h2>
          <p className="subtitle">Audit model classifications and confidence scores directly via REST API</p>
        </div>

        <form onSubmit={handleTest} className="tester-form">
          <div className="input-group">
            <input
              type="text"
              className="text-input"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type any English or Hinglish comment to test..."
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !testInput.trim()}>
              {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
              <span>Classify</span>
            </button>
          </div>

          <div className="sample-chips">
            <span className="chips-label">Sample Test Cases:</span>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => setTestInput(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className={`result-card ${result.is_bullying ? 'result-danger' : 'result-safe'}`}>
            <div className="result-header">
              {result.is_bullying ? (
                <>
                  <ShieldAlert size={28} className="result-icon danger-color" />
                  <div>
                    <h3 className="danger-color">Blocked — Cyberbullying Detected</h3>
                    <p>Classification: <strong>Class 1</strong> (Abusive/Toxic)</p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldCheck size={28} className="result-icon safe-color" />
                  <div>
                    <h3 className="safe-color">Approved — Non-Bullying</h3>
                    <p>Classification: <strong>Class 0</strong> (Safe/Normal)</p>
                  </div>
                </>
              )}
            </div>

            <div className="result-metrics">
              <div className="metric-box">
                <span className="metric-label">Model Probability</span>
                <span className="metric-val">{(result.confidence * 100).toFixed(2)}%</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Decision Threshold</span>
                <span className="metric-val">50.0%</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Preprocessed Tokens</span>
                <code className="metric-code">{result.cleaned_text || '(none/empty)'}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
