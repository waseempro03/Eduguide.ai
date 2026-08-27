import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, FileText, Maximize2, Minimize2, Edit3, Eye } from 'lucide-react';
import { downloadArtifact } from '../utils/exportUtils';

export default function ArtifactsPanel({ artifact, onClose }) {
  if (!artifact) return null;

  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'edit'
  const [content, setContent] = useState(artifact.content || '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy artifact:', err);
    }
  };

  const handleDownload = () => {
    downloadArtifact(artifact.title, content, artifact.language || 'text');
  };

  const isCode = Boolean(artifact.language && artifact.language !== 'text' && artifact.language !== 'markdown');

  return (
    <aside className={`artifacts-panel ${isExpanded ? 'expanded' : ''}`}>
      {/* Panel Top Header */}
      <div className="artifacts-header">
        <div className="artifacts-header-title">
          {isCode ? <Code size={16} className="artifact-type-icon" /> : <FileText size={16} className="artifact-type-icon" />}
          <div>
            <h3 className="artifact-title" title={artifact.title}>{artifact.title || 'Artifact Canvas'}</h3>
            <span className="artifact-sub">{artifact.language ? `${artifact.language.toUpperCase()} • Interactive Canvas` : 'Interactive Document'}</span>
          </div>
        </div>

        <div className="artifacts-header-actions">
          {/* Preview / Edit Toggle */}
          <div className="artifact-tab-group">
            <button
              className={`artifact-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
              title="Preview Mode"
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
            <button
              className={`artifact-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
              title="Edit Mode"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
          </div>

          <button
            className="icon-btn artifact-action-btn"
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard' : 'Copy content'}
          >
            {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
          </button>

          <button
            className="icon-btn artifact-action-btn"
            onClick={handleDownload}
            title="Download file"
          >
            <Download size={15} />
          </button>

          <button
            className="icon-btn artifact-action-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore side panel' : 'Expand full screen'}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            className="icon-btn artifact-action-btn"
            onClick={onClose}
            title="Close Canvas"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Artifact Body / Canvas Content */}
      <div className="artifacts-body">
        {activeTab === 'edit' ? (
          <textarea
            className="artifact-editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        ) : isCode ? (
          <pre className="artifact-code-block">
            <code>{content}</code>
          </pre>
        ) : (
          <div className="artifact-document-view">
            {content.split('\n').map((line, idx) => (
              <p key={idx} className="artifact-doc-line">{line || '\u00A0'}</p>
            ))}
          </div>
        )}
      </div>

      {/* Artifact Footer */}
      <div className="artifacts-footer">
        <span className="artifact-char-count">{content.length} characters • {content.split(/\s+/).filter(Boolean).length} words</span>
        <button className="btn btn-primary artifact-copy-bottom" onClick={handleCopy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy All'}</span>
        </button>
      </div>
    </aside>
  );
}
