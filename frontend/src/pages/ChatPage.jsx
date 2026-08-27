import React, { useState, useEffect } from 'react';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import ArtifactsPanel from '../components/ArtifactsPanel';
import SettingsModal from '../components/SettingsModal';
import AboutModal from '../components/AboutModal';
import { sendMessage, sendFeedback, getProfile } from '../services/api';
import { exportChatAsMarkdown } from '../utils/exportUtils';

export default function ChatPage({
  onNavigate,
  currentUser,
  onLogout,
  theme = 'dark',
  onThemeChange,
  sessions = [],
  setSessions,
  activeSessionId,
  setActiveSessionId,
  isSidebarOpen = true,
  setIsSidebarOpen
}) {
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);

  // Load student profile for background context
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getProfile();
        if (res && res.profile) setStudentProfile(res.profile);
      } catch (err) {}
    }
    loadProfile();
  }, []);

  const safeSessions = Array.isArray(sessions) && sessions.length > 0
    ? sessions
    : [{ id: 'session_init', title: 'New chat', messages: [] }];
  const activeSession = safeSessions.find(s => s && s.id === activeSessionId) || safeSessions[0];
  const activeMessages = activeSession && Array.isArray(activeSession.messages) ? activeSession.messages : [];

  const handleSendMessage = async (text, attachments = []) => {
    if ((!text || !text.trim()) && attachments.length === 0) return;
    if (isLoading) return;

    const userQuery = text.trim();
    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userQuery,
      attachments: attachments.map(a => ({ id: a.id, name: a.name, isImage: a.isImage, data: a.data })),
      timestamp: new Date().toISOString()
    };

    // Auto name session on first user message
    const isFirstMessage = activeMessages.length === 0;
    const cleanTitle = isFirstMessage
      ? userQuery.length > 26 ? userQuery.substring(0, 26) + '...' : userQuery
      : activeSession.title;

    const updatedMessages = [...activeMessages, userMsg];

    setSessions(prev =>
      prev.map(s => s.id === activeSessionId ? { ...s, title: cleanTitle, messages: updatedMessages } : s)
    );

    setIsLoading(true);

    try {
      const historyContext = updatedMessages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || ''
      }));

      const res = await sendMessage(
        userQuery,
        activeSessionId,
        historyContext,
        studentProfile,
        { modelPreference: selectedModel, attachments }
      );

      const fullAnswer = res.answer || '';
      const botMsgId = `bot_${Date.now()}`;

      // Initialize bot message
      const botMsg = {
        id: botMsgId,
        sender: 'bot',
        messageId: res.messageId,
        text: '',
        intent: res.intent,
        entities: res.entities,
        sources: res.sources || [],
        source: res.source,
        matchedData: res.matchedData,
        matched: res.matched,
        thinking: res.thinking || null,
        userQuery: userQuery,
        timestamp: new Date().toISOString(),
        feedback: null
      };

      // Add placeholder bot message
      setSessions(prev =>
        prev.map(s => s.id === activeSessionId ? { ...s, messages: [...updatedMessages, botMsg] } : s)
      );

      // Smooth streaming typewriter simulation for instantaneous responsive feel
      const words = fullAnswer.split(' ');
      let currentText = '';
      const chunkSize = Math.max(1, Math.floor(words.length / 25));

      for (let i = 0; i < words.length; i += chunkSize) {
        currentText = words.slice(0, i + chunkSize).join(' ');
        setSessions(prev =>
          prev.map(s => {
            if (s.id !== activeSessionId) return s;
            return {
              ...s,
              messages: s.messages.map(m => m.id === botMsgId ? { ...m, text: currentText } : m)
            };
          })
        );
        await new Promise(r => setTimeout(r, 20));
      }

      // Final complete text
      setSessions(prev =>
        prev.map(s => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map(m => m.id === botMsgId ? { ...m, text: fullAnswer } : m)
          };
        })
      );

      // Auto open Artifacts canvas if code or long structured guide is detected
      if (fullAnswer.includes('```') && !activeArtifact) {
        const codeMatch = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/.exec(fullAnswer);
        if (codeMatch) {
          setActiveArtifact({
            title: `${(codeMatch[1] || 'code').toUpperCase()} Script Artifact`,
            content: codeMatch[2].trim(),
            language: codeMatch[1] || 'python'
          });
        }
      }
    } catch (error) {
      console.error('Error in chat exchange:', error);
      const errorMsg = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: "I experienced a temporary connection issue. Please check your network or try asking again.",
        isFallback: true,
        userQuery: userQuery,
        timestamp: new Date().toISOString(),
        feedback: null
      };
      setSessions(prev =>
        prev.map(s => s.id === activeSessionId ? { ...s, messages: [...updatedMessages, errorMsg] } : s)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession = { id: newId, title: 'New chat', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveArtifact(null);
  };

  const handleClearCurrentChat = () => {
    setSessions(prev =>
      prev.map(s => s.id === activeSessionId ? { ...s, title: 'New chat', messages: [] } : s)
    );
    setActiveArtifact(null);
  };

  const handleFeedback = async (messageId, rating, faqId, userQuery, answerText) => {
    try {
      await sendFeedback({ messageId, rating, faqId, userQuery, answerText });
      setSessions(prev =>
        prev.map(s => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map(m => m.messageId === messageId ? { ...m, feedback: rating } : m)
          };
        })
      );
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleExportChat = () => {
    exportChatAsMarkdown(activeSession?.title || 'EduGuide AI Chat', activeMessages);
  };

  return (
    <div className="chat-layout" style={{ flex: 1, display: 'flex', width: '100%', height: '100%' }}>
      {/* Main Conversation Stream */}
      <div className={`chat-main ${activeArtifact ? 'with-artifacts' : ''}`} style={{ flex: 1 }}>
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen && setIsSidebarOpen(prev => !prev)}
          onNewChat={handleNewChat}
          onClearChat={handleClearCurrentChat}
          onExportChat={handleExportChat}
          selectedModel={selectedModel}
          onSelectModel={(modelId) => setSelectedModel(modelId)}
          currentUser={currentUser}
          theme={theme}
          onThemeChange={onThemeChange}
          onOpenLogin={() => onNavigate('login')}
          onLogout={onLogout}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAbout={() => setShowAbout(true)}
        />

        <ChatMessages
          messages={activeMessages}
          isLoading={isLoading}
          onFeedback={handleFeedback}
          onSelectQuery={(query) => handleSendMessage(query)}
          onOpenArtifact={(art) => setActiveArtifact(art)}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Claude-Style Interactive Artifacts Split-Screen Canvas */}
      {activeArtifact && (
        <ArtifactsPanel
          artifact={activeArtifact}
          onClose={() => setActiveArtifact(null)}
        />
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        onThemeChange={onThemeChange}
      />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
