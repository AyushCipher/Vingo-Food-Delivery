import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ChatInterface = ({ sessionId, userRole, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/chat/history/${sessionId}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
        // Don't show error for first-time users
      }
    };

    fetchHistory();
  }, [sessionId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError('');

    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/chat/message`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userMessage,
            userRole: userRole === 'user' ? 'customer' : (userRole || 'customer'),
            currentPage: window.location.pathname,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data.success) {
        // Add bot message
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            content: data.message,
            timestamp: new Date(),
            source: data.source,
          },
        ]);
      } else {
        setError('Failed to get response. Please try again.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Network error. Please check your connection.');
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again later.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      {/* Header */}
      <div className="chat-header">
        <h3>Vingo Support</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close chat">
          ✕
        </button>
      </div>

      {/* Messages Container */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <h4>👋 Hello!</h4>
            <p>How can I help you today?</p>
            <div className="quick-suggestions">
              <button
                className="quick-btn"
                onClick={() => setInputValue('How do I track my order?')}
              >
                Track order
              </button>
              <button
                className="quick-btn"
                onClick={() => setInputValue('I need help with payment')}
              >
                Payment help
              </button>
              <button
                className="quick-btn"
                onClick={() => setInputValue('How do I contact support?')}
              >
                Contact support
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.source === 'ai' && (
                  <span className="ai-badge">🤖 AI</span>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="chat-message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="chat-error">
            <p>{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form className="chat-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your question..."
          disabled={isLoading}
          maxLength={200}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          Send
        </button>
      </form>

      {/* Footer */}
      <div className="chat-footer">
        <small>Powered by Vingo Support</small>
      </div>
    </div>
  );
};

export default ChatInterface;
