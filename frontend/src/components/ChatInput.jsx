import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled = false, enterToSend = true }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  // Speech to Text Web Speech API
  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          try {
            const transcript = Array.from(event.results)
              .map(result => result[0].transcript)
              .join('');
            setText(prev => `${prev} ${transcript}`.trim());
          } catch (err) {}
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    } catch (e) {
      console.warn('Speech recognition not available:', e);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum allowed size is 5MB.`);
        continue;
      }

      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');

      reader.onload = () => {
        const result = reader.result;
        setAttachments(prev => [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            isImage,
            data: typeof result === 'string' ? result : null,
            text: !isImage && typeof result === 'string' ? result : null
          }
        ]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!text.trim() && attachments.length === 0) || disabled) return;

    const queryText = text.trim() || (attachments.length > 0 ? `Please analyze the attached file(s): ${attachments.map(a => a.name).join(', ')}` : '');
    onSendMessage(queryText, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <form className="chat-input-box" onSubmit={handleSubmit}>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.txt,.doc,.docx"
          multiple
        />

        {/* Attachment Thumbnail Chips */}
        {attachments.length > 0 && (
          <div className="input-attachments-row">
            {attachments.map((att) => (
              <div key={att.id} className="attachment-chip">
                {att.isImage ? (
                  <img src={att.data} alt={att.name} className="attachment-thumb" />
                ) : (
                  <FileText size={14} className="attachment-icon" />
                )}
                <span className="attachment-name" title={att.name}>{att.name}</span>
                <button
                  type="button"
                  className="attachment-remove-btn"
                  onClick={() => removeAttachment(att.id)}
                  title="Remove file"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="input-main-row">
          {/* Paperclip File Upload Button */}
          <button
            type="button"
            className="input-tool-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image or document (Max 5MB)"
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder={isRecording ? 'Listening... Speak now...' : 'Ask EduGuide AI anything or attach files...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            maxLength={2000}
          />

          {/* Voice Dictation Button */}
          <button
            type="button"
            className={`input-tool-btn mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            title={isRecording ? 'Stop listening' : 'Voice input (Dictate)'}
            aria-label="Voice input"
          >
            {isRecording ? <MicOff size={18} color="var(--danger)" /> : <Mic size={18} />}
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            className="send-btn"
            disabled={(!text.trim() && attachments.length === 0) || disabled}
            title="Send message"
            aria-label="Send message"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </form>

      <div className="chat-disclaimer">
        EduGuide AI can make mistakes. Verify important academic details with official sources.
      </div>
    </div>
  );
}
