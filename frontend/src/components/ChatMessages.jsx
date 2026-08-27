import React, { useEffect, useRef } from 'react';
import WelcomeScreen from './WelcomeScreen';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

export default function ChatMessages({
  messages = [],
  isTyping,
  isLoading,
  onSelectQuery,
  onFeedback,
  onOpenArtifact
}) {
  const bottomRef = useRef(null);
  const showTyping = isTyping || isLoading;
  const safeMessages = Array.isArray(messages) ? messages.filter(Boolean) : [];

  useEffect(() => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {}
  }, [safeMessages, showTyping]);

  return (
    <div className="chat-messages-container messages-container">
      {safeMessages.length === 0 ? (
        <WelcomeScreen onSelectQuery={onSelectQuery} />
      ) : (
        <div className="messages-inner messages-wrapper">
          {safeMessages.map((msg, idx) => (
            <Message
              key={msg.id || `msg_${idx}`}
              message={msg}
              onFeedback={onFeedback}
              onSelectQuery={onSelectQuery}
              onOpenArtifact={onOpenArtifact}
            />
          ))}

          {showTyping && <TypingIndicator />}

          <div ref={bottomRef} style={{ height: '1px', flexShrink: 0 }} />
        </div>
      )}
    </div>
  );
}
