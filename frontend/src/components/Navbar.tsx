import React from 'react';
import { Shield, RefreshCw, Trash2, Hash } from 'lucide-react';

interface NavbarProps {
  username: string | null;
  room: string;
  isConnected: boolean;
  onClearChat: () => void;
  onChangeUser: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  username,
  room,
  isConnected,
  onClearChat,
  onChangeUser,
}) => {
  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="brand-logo">
          <div className="shield-icon-wrapper">
            <Shield className="shield-icon" size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-title">CyberShield</span>
          </div>
        </div>

        {username && (
          <div className="room-badge">
            <Hash size={14} className="room-hash-icon" />
            <span className="room-name">{room.toLowerCase()}</span>
          </div>
        )}
      </div>

      <div className="nav-right">
        <div className={`status-pill ${isConnected ? 'online' : 'offline'}`} title="Server Connection Status">
          <span className="status-dot"></span>
          <span>{isConnected ? 'Online' : 'Reconnecting...'}</span>
        </div>

        {username && (
          <>
            <button
              className="nav-btn"
              onClick={onClearChat}
              title="Clear messages from screen"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
            <button
              className="nav-btn user-btn"
              onClick={onChangeUser}
              title={`Logged in as ${username}. Click to switch name.`}
            >
              <RefreshCw size={13} />
              <span>{username}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
