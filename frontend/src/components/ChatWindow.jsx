import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { Sparkles, GraduationCap, Building2, BookOpen, Clock } from 'lucide-react';

export default function ChatWindow({
  messages,
  isTyping,
  onFeedback,
  onSelectSuggestion
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="welcome-hero">
          <div className="welcome-avatar">
            <GraduationCap size={32} />
          </div>
          <h2>Welcome to CampusConnect</h2>
          <p>
            Your intelligent 24/7 student companion. Ask any question about admissions,
            tuition fees, hostel life, exam schedules, library access, or campus placements.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            marginTop: '24px',
            textAlign: 'left'
          }}>
            <div className="glass-panel" style={{ padding: '12px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '4px' }}>
                <Building2 size={14} /> Admissions
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Deadlines, eligibility, documents & fees</p>
            </div>

            <div className="glass-panel" style={{ padding: '12px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600, marginBottom: '4px' }}>
                <Clock size={14} /> Exams & Rules
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Timetables, grading scale, attendance</p>
            </div>

            <div className="glass-panel" style={{ padding: '12px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6', fontWeight: 600, marginBottom: '4px' }}>
                <BookOpen size={14} /> Campus Life
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Hostel rooms, dining, Wi-Fi & sports</p>
            </div>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onFeedback={onFeedback}
            onSelectSuggestion={onSelectSuggestion}
          />
        ))
      )}

      {isTyping && <TypingIndicator />}

      <div ref={bottomRef} style={{ height: '1px' }} />
    </div>
  );
}
