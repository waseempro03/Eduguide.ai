import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Check, Zap, Cpu } from 'lucide-react';

const MODELS = [
  {
    id: 'gemini',
    name: 'Gemini 3.6 Flash',
    tag: 'Default • Fast & Smart',
    icon: Sparkles,
    color: 'var(--accent-primary)'
  },
  {
    id: 'openai',
    name: 'GPT-4o Mini',
    tag: 'OpenAI Engine',
    icon: Zap,
    color: '#10b981'
  },
  {
    id: 'local',
    name: 'EduGuide Local NLP',
    tag: 'Offline Engine',
    icon: Cpu,
    color: '#f59e0b'
  }
];

export default function ModelSelector({ selectedModel = 'gemini', onSelectModel }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];
  const IconComponent = activeModel.icon;

  return (
    <div className="model-selector-container" ref={dropdownRef}>
      <button
        type="button"
        className="model-selector-pill"
        onClick={() => setOpen(!open)}
        title="Switch AI Engine"
      >
        <IconComponent size={14} style={{ color: activeModel.color }} />
        <span className="model-name-text">{activeModel.name}</span>
        <ChevronDown size={13} className={`chevron-icon ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="model-dropdown-menu">
          <div className="model-dropdown-header">Select Model Engine</div>
          {MODELS.map((m) => {
            const ItemIcon = m.icon;
            const isSelected = m.id === selectedModel;
            return (
              <button
                key={m.id}
                type="button"
                className={`model-option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectModel(m.id);
                  setOpen(false);
                }}
              >
                <div className="model-option-left">
                  <ItemIcon size={16} style={{ color: m.color }} />
                  <div className="model-option-text">
                    <div className="model-option-name">{m.name}</div>
                    <div className="model-option-tag">{m.tag}</div>
                  </div>
                </div>
                {isSelected && <Check size={14} className="model-check-icon" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
