import React, { useState } from 'react';
import FeedbackButtons from './FeedbackButtons';
import SourceCitations from './SourceCitations';
import { Check, Sparkles, Volume2, VolumeX, Copy, Code, LayoutDashboard, Brain, ChevronDown, ChevronUp, FileText } from 'lucide-react';

function cleanAndFormatText(text) {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{3,}/g, '')
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .trim();
}

/**
 * Helper to split text into code blocks and normal paragraphs
 */
function parseMessageContent(text) {
  if (!text) return [];
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: cleanAndFormatText(text.substring(lastIndex, match.index))
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trim()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: cleanAndFormatText(text.substring(lastIndex))
    });
  }

  return parts;
}

export default function Message({ message = {}, onFeedback, onSelectQuery, onOpenArtifact }) {
  const isUser = message && message.sender === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const rawText = (message && message.text) || '';
  const cleanAnswer = cleanAndFormatText(rawText);
  const parsedParts = parseMessageContent(rawText);
  const hasCode = parsedParts.some(p => p.type === 'code');
  const isLongContent = cleanAnswer.length > 250 || hasCode;

  // Text-to-speech handler
  const handleSpeakToggle = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // stop previous
      const utterance = new SpeechSynthesisUtterance(cleanAnswer);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyCode = async (codeText, idx) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (isUser) {
    return (
      <div className="message-item user">
        <div className="user-bubble">
          {Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <div className="user-attachments-bubble">
              {message.attachments.map(att => (
                <div key={att.id || Math.random()} className="user-att-pill">
                  {att && att.isImage ? (
                    <img src={att.data} alt={att.name || 'image'} className="user-att-thumb" />
                  ) : (
                    <FileText size={12} />
                  )}
                  <span>{att ? att.name : 'file'}</span>
                </div>
              ))}
            </div>
          )}
          {cleanAndFormatText(message.text)}
        </div>
      </div>
    );
  }

  // Assistant message
  const isOutOfScope = message.intent === 'OUT_OF_SCOPE';

  return (
    <div className="message-item bot">
      <div className="bot-avatar">✦</div>

      <div className="bot-content-col">
        {/* Thinking / Reasoning Accordion (Claude / DeepSeek style) */}
        {message.thinking && (
          <div className="thinking-accordion">
            <button
              type="button"
              className="thinking-toggle-btn"
              onClick={() => setShowThinking(!showThinking)}
            >
              <Brain size={14} className="thinking-icon" />
              <span>Thinking Process</span>
              {showThinking ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showThinking && (
              <div className="thinking-content">
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Main Answer Content */}
        <div className="bot-text">
          {hasCode ? (
            parsedParts.map((part, idx) => {
              if (part.type === 'code') {
                return (
                  <div key={idx} className="code-block-card">
                    <div className="code-block-header">
                      <span className="code-lang-tag">{part.language || 'code'}</span>
                      <div className="code-header-actions">
                        <button
                          type="button"
                          className="code-action-btn"
                          onClick={() => handleCopyCode(part.content, idx)}
                          title="Copy Code"
                        >
                          {copiedIndex === idx ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                        {onOpenArtifact && (
                          <button
                            type="button"
                            className="code-action-btn"
                            onClick={() => onOpenArtifact({
                              title: `${part.language.toUpperCase()} Code Artifact`,
                              content: part.content,
                              language: part.language
                            })}
                            title="Open in Side Canvas"
                          >
                            <LayoutDashboard size={13} />
                            <span>Canvas</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <pre className="code-content-pre">
                      <code>{part.content}</code>
                    </pre>
                  </div>
                );
              }
              return <div key={idx} className="bot-text-segment">{part.content}</div>;
            })
          ) : (
            cleanAnswer
          )}
        </div>

        {/* Source Citations */}
        {Array.isArray(message.sources) && message.sources.length > 0 && (
          <SourceCitations sources={message.sources} />
        )}

        {/* Metadata & Actions Row */}
        <div className="bot-meta-row" style={{ marginTop: '8px' }}>
          {message.intent && !isOutOfScope && (
            <span className="faq-source-badge">
              <Check size={11} color="var(--success)" /> Verified {message.intent.replace('_', ' ')}
            </span>
          )}

          {message.source === 'gemini' && (
            <span className="faq-source-badge">
              <Sparkles size={11} color="var(--accent-primary)" /> Gemini AI
            </span>
          )}

          {message.source === 'openai' && (
            <span className="faq-source-badge">
              <Sparkles size={11} color="var(--accent-primary)" /> OpenAI
            </span>
          )}

          {/* Text to speech Read Aloud button */}
          <button
            type="button"
            className={`tool-icon-btn ${isSpeaking ? 'active-speaking' : ''}`}
            onClick={handleSpeakToggle}
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            aria-label="Read aloud"
          >
            {isSpeaking ? <VolumeX size={14} color="var(--danger)" /> : <Volume2 size={14} />}
          </button>

          {/* Open in Artifacts Canvas button */}
          {isLongContent && onOpenArtifact && (
            <button
              type="button"
              className="open-canvas-badge-btn"
              onClick={() => onOpenArtifact({
                title: message.userQuery ? `${message.userQuery.substring(0, 30)}...` : 'Document Artifact',
                content: message.text,
                language: hasCode ? 'code' : 'markdown'
              })}
              title="Open in interactive split-screen canvas"
            >
              <LayoutDashboard size={12} />
              <span>Open in Canvas</span>
            </button>
          )}

          <FeedbackButtons
            messageId={message.messageId}
            faqId={message.faqId}
            userQuery={message.userQuery}
            answerText={cleanAnswer}
            initialFeedback={message.feedback}
            onFeedback={onFeedback}
          />
        </div>
      </div>
    </div>
  );
}
