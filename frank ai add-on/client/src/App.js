import React, { useState } from 'react';

export default function Frank() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are Frank, a friendly assistant.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setLoading(true);
    setInput('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.filter(m => m.role !== 'system') }),
      });
      const data = await res.json();
      if (data.assistant) {
        setMessages([...newMessages, data.assistant]);
      } else {
        setMessages(newMessages);
        alert('No response from assistant.');
      }
    } catch {
      alert('Error sending message');
      setMessages(newMessages);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 10 }}>
      <h1>Frank Chatbot</h1>
      <div style={{ minHeight: 300, border: '1px solid #ccc', padding: 10, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '10px 0' }}>
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
      </div>
      <textarea
        rows={3}
        style={{ width: '100%' }}
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading}>Send</button>
    </div>
  );
}
