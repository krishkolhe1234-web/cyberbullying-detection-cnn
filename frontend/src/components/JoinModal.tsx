import React, { useState } from 'react';
import { Shield, ArrowRight, Hash } from 'lucide-react';

interface JoinModalProps {
  onJoin: (username: string, room: string) => void;
  defaultRoom?: string;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  onJoin,
  defaultRoom = 'general',
}) => {
  const [name, setName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(defaultRoom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), selectedRoom.trim() || 'general');
    }
  };

  return (
    <div className="join-container">
      <div className="join-card">
        <div className="join-header">
          <div className="shield-hero-badge">
            <Shield size={28} className="hero-shield-icon" />
          </div>
          <h1 className="join-title">Join Chat Room</h1>
          <p className="join-desc">
            Enter your display name to start chatting with real-time cyberbullying protection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="display-name" className="field-label">
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={24}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="room-name" className="field-label">
              Room
            </label>
            <div className="room-input-wrapper">
              <Hash size={16} className="room-icon" />
              <input
                id="room-name"
                type="text"
                className="text-input has-icon"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                placeholder="general"
                maxLength={32}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!name.trim()}
          >
            <span>Join Conversation</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
