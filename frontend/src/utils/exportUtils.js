/**
 * Export conversation session as Markdown or Text file
 */
export function exportChatAsMarkdown(sessionTitle, messages = []) {
  if (!messages || messages.length === 0) {
    alert('No messages in this chat to export.');
    return;
  }

  const title = sessionTitle || 'Wiz.AI Conversation';
  let md = `# ${title}\n\n*Exported from Wiz.AI / EduGuide AI on ${new Date().toLocaleString()}*\n\n---\n\n`;

  messages.forEach((msg, idx) => {
    const senderName = msg.sender === 'user' ? '👤 User' : '✦ EduGuide AI';
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
    md += `### ${senderName} ${timestamp ? `(${timestamp})` : ''}\n\n`;
    md += `${msg.text}\n\n`;
    if (msg.sources && msg.sources.length > 0) {
      md += `**Sources:**\n`;
      msg.sources.forEach(s => {
        md += `- [${s.title}](${s.url})\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}_chat.md`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Artifact content as file
 */
export function downloadArtifact(title, content, type = 'text') {
  const extension = type === 'python' ? 'py' : type === 'javascript' ? 'js' : type === 'html' ? 'html' : type === 'markdown' ? 'md' : 'txt';
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (title || 'artifact').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `${safeName}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
