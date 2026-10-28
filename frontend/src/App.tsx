import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from './services/api';
import type { ChatMessage, BlockedWarning } from './types';
import { Navbar } from './components/Navbar';
import { JoinModal } from './components/JoinModal';
import { ChatMessageItem } from './components/ChatMessageItem';
import { BlockedWarningModal } from './components/BlockedWarningModal';
import { Send, ShieldCheck, Hash } from 'lucide-react';
import './styles.css';

export const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [room, setRoom] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [blockedWarning, setBlockedWarning] = useState<BlockedWarning | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket.IO event listeners
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room_joined', (data: { room: string; username: string; timestamp: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_join_${Date.now()}`,
          username: 'System',
          text: `You joined #${data.room.toLowerCase()}.`,
          timestamp: data.timestamp,
          isSystem: true,
        },
      ]);
    });

    socket.on('user_joined', (data: { username: string; message: string; timestamp: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_user_${Date.now()}_${Math.random()}`,
          username: 'System',
          text: data.message,
          timestamp: data.timestamp,
          isSystem: true,
        },
      ]);
    });

    socket.on('user_left', (data: { username: string; message: string; timestamp: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_left_${Date.now()}_${Math.random()}`,
          username: 'System',
          text: data.message,
          timestamp: data.timestamp,
          isSystem: true,
        },
      ]);
    });

    socket.on('receive_message', (msg: { id: string; username: string; text: string; timestamp: string; confidence: number }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          username: msg.username,
          text: msg.text,
          timestamp: msg.timestamp,
          isSelf: msg.username === username,
          confidence: msg.confidence,
        },
      ]);
    });

    // Intercept blocked message warning (private to sender)
    socket.on('message_blocked', (warning: BlockedWarning) => {
      setBlockedWarning(warning);
    });

    socket.on('error_notification', (data: { message: string }) => {
      alert(`Notice: ${data.message}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_joined');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('receive_message');
      socket.off('message_blocked');
      socket.off('error_notification');
    };
  }, [socket, username]);

  // Handle joining room
  const handleJoin = (newName: string, newRoom: string) => {
    setUsername(newName);
    setRoom(newRoom);
    socket.emit('join_room', { username: newName, room: newRoom });
  };

  // Handle sending message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !username) return;

    socket.emit('send_message', {
      username,
      room,
      text: inputText.trim(),
    });

    setInputText('');
  };

  // Handle re-sending a corrected message from blocked modal
  const handleResendCorrected = (correctedText: string) => {
    if (!username || !correctedText.trim()) return;

    socket.emit('send_message', {
      username,
      room,
      text: correctedText.trim(),
    });
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleChangeUser = () => {
    setUsername(null);
    setMessages([]);
  };

  return (
    <>
      <Navbar
        username={username}
        room={room}
        isConnected={isConnected}
        onClearChat={handleClearChat}
        onChangeUser={handleChangeUser}
      />

      <main className="app-layout">
        {!username ? (
          <JoinModal onJoin={handleJoin} defaultRoom={room} />
        ) : (
          <div className="chat-window">
            {/* Clean, professional channel header */}
            <div className="chat-channel-header">
              <div className="channel-title-group">
                <Hash size={18} className="channel-hash" />
                <span className="channel-title">{room.toLowerCase()}</span>
              </div>
              <div className="channel-protection-badge" title="Automated Real-time Content Moderation Active">
                <ShieldCheck size={14} className="shield-check" />
                <span>Protected Room</span>
              </div>
            </div>

            <div className="messages-scroll-area">
              {messages.length === 0 ? (
                <div className="empty-chat-state">
                  <div className="empty-icon-box">
                    <Hash size={32} />
                  </div>
                  <h3>Welcome to #{room.toLowerCase()}</h3>
                  <p>This is the start of the #{room.toLowerCase()} conversation. Messages sent here are safe and moderated.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatMessageItem key={msg.id} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-bar">
              <input
                type="text"
                className="message-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message #${room.toLowerCase()}...`}
                autoFocus
              />
              <button
                type="submit"
                className="btn-send"
                disabled={!inputText.trim()}
                title="Send Message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Cyberbullying Blocked Warning Modal */}
      <BlockedWarningModal
        warning={blockedWarning}
        onClose={() => setBlockedWarning(null)}
        onResend={handleResendCorrected}
      />
    </>
  );
};
export default App;
