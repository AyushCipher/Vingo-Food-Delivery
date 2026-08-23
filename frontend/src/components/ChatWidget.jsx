import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import './ChatWidget.css';

const ChatWidget = ({ userId, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate or retrieve session ID
  useEffect(() => {
    const existingSessionId = localStorage.getItem('chatSessionId');

    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      // Generate new session ID using a cryptographically random UUID so it
      // can't be guessed/brute-forced (sessionId doubles as the access token
      // for anonymous chat history on the backend)
      const newSessionId = `session_${crypto.randomUUID()}`;
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Clear unread count when opening
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <div className="chat-widget">
        <button
          className="chat-bubble"
          onClick={toggleChat}
          title="Chat with Vingo Support"
          aria-label={isOpen ? "Close chat support" : "Open chat support"}
          aria-expanded={isOpen}
        >
          <span className="chat-icon">💬</span>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </button>

        {/* Chat Window */}
        {isOpen && sessionId && (
          <div className="chat-window">
            <ChatInterface
              sessionId={sessionId}
              userId={userId}
              userRole={userRole}
              onClose={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="chat-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default ChatWidget;
