import React from 'react';
import { User, ShieldCheck } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  if (message.isSystem) {
    return (
      <div className="system-message">
        <span className="system-pill">{message.text}</span>
        <span className="system-time">{message.timestamp}</span>
      </div>
    );
  }

  const isSelf = message.isSelf;

  return (
    <div className={`message-row ${isSelf ? 'self-row' : 'other-row'}`}>
      {!isSelf && (
        <div className="avatar-bubble" title={message.username}>
          <User size={18} />
        </div>
      )}

      <div className={`message-bubble ${isSelf ? 'self-bubble' : 'other-bubble'}`}>
        <div className="message-header">
          <span className="sender-name">{isSelf ? 'You' : message.username}</span>
          <span className="message-time">{message.timestamp}</span>
        </div>

        <div className="message-body">
          {message.text}
        </div>

        <div className="message-footer">
          <span className="verified-badge" title="Verified Safe by CyberShield 1D CNN">
            <ShieldCheck size={12} />
            <span>Safe</span>
          </span>
        </div>
      </div>
    </div>
  );
};
