import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="message-item bot">
      <div className="bot-avatar">✦</div>
      <div className="bot-content-col">
        <div className="typing-dots">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );
}
