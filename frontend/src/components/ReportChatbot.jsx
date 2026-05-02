import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react'

const C = {
  navy:      '#1a2e4a',
  blue:      '#1565c0',
  teal:      '#00796b',
  white:     '#ffffff',
  lightBg:   '#f0f4f8',
  border:    '#d6dce4',
  textDark:  '#1a2332',
  textMed:   '#37474f',
  textLight: '#607d8b',
}

export default function ReportChatbot({ report, prediction, confidence, mode, patientInfo, mongoId }) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      if (!hasGreeted) {
        const greeting = mode === 'doctor'
          ? `Hello! I have access to the full radiology report for **${patientInfo?.name || 'this patient'}**. The AI has detected **${prediction}** with **${confidence}% confidence**. Ask me anything about the findings, impression, or recommendations.`
          : `Hi ${patientInfo?.name || 'there'}! 👋 I've read your scan report and I'm here to help you understand it. Feel free to ask me anything — I'll explain it in simple words!`
        setMessages([{ role: 'assistant', content: greeting }])
        setHasGreeted(true)
      }
    }
  }, [open])

  const sendMessage = async () => {
    console.log('sending with mongoId:', mongoId)
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          report,
          prediction,
          confidence,
          mode,
          patient_info: patientInfo,
          history: messages.filter(m => m.role !== 'system'),
          mongo_id: mongoId,
        }),
      })

      const data = await response.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that. Please try again.' }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check if the backend is running.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Suggested questions based on mode
  const suggestions = mode === 'doctor'
    ? ['What are the key findings?', 'What does the impression say?', 'What follow-up is recommended?']
    : ['What did they find?', 'Is it serious?', 'What should I do next?']

  const renderMessage = (content) => {
    // Simple markdown-like bold rendering
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: open ? C.navy : C.blue,
          boxShadow: '0 4px 20px rgba(21,101,192,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.25s ease',
          transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
          border: `2px solid ${open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)'}`,
        }}
        title="Ask about this report"
      >
        {open
          ? <X size={22} color="#fff" />
          : <MessageCircle size={22} color="#fff" />
        }
        {/* Pulse ring when closed */}
        {!open && (
          <div style={{
            position: 'absolute',
            width: '56px', height: '56px',
            borderRadius: '50%',
            border: '2px solid rgba(21,101,192,0.4)',
            animation: 'pulse-ring 2s ease-out infinite',
          }} />
        )}
      </div>

      {/* ── Chat Window ── */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '28px',
          width: '380px',
          height: '520px',
          background: C.white,
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          animation: 'slide-up 0.25s ease',
        }}>

          {/* Header */}
          <div style={{
            background: C.navy,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(144,202,249,0.15)',
              border: '1px solid rgba(144,202,249,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={18} color="#90caf9" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                Report Assistant
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: "'DM Sans', sans-serif" }}>
                {mode === 'doctor' ? 'Clinical Q&A' : 'Patient Help'} · {prediction}
              </div>
            </div>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#4caf50',
              boxShadow: '0 0 6px rgba(76,175,80,0.6)',
            }} />
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: C.lightBg,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px',
                alignItems: 'flex-end',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: C.navy, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bot size={13} color="#90caf9" />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 13px',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? C.blue : C.white,
                  color: msg.role === 'user' ? '#fff' : C.textMed,
                  fontSize: '13px',
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.55,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  border: msg.role === 'assistant' ? `1px solid ${C.border}` : 'none',
                }}
                  dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                />
                {msg.role === 'user' && (
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: C.blue, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={13} color="#fff" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: C.navy, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={13} color="#90caf9" />
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: C.white, borderRadius: '14px 14px 14px 4px',
                  border: `1px solid ${C.border}`,
                  display: 'flex', gap: '5px', alignItems: 'center',
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: C.textLight,
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — show only at start */}
          {messages.length === 1 && (
            <div style={{
              padding: '8px 12px',
              display: 'flex', gap: '6px', flexWrap: 'wrap',
              borderTop: `1px solid ${C.border}`,
              background: C.white,
              flexShrink: 0,
            }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus() }}
                  style={{
                    padding: '4px 10px', borderRadius: '12px',
                    border: `1px solid ${C.border}`,
                    background: C.lightBg, color: C.textMed,
                    fontSize: '11px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: `1px solid ${C.border}`,
            background: C.white,
            display: 'flex', gap: '8px', alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'doctor' ? 'Ask about findings, impression...' : 'Ask anything about your report...'}
              rows={1}
              style={{
                flex: 1, resize: 'none', border: `1px solid ${C.border}`,
                borderRadius: '10px', padding: '8px 12px',
                fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                color: C.textDark, outline: 'none',
                background: C.lightBg, lineHeight: 1.4,
                maxHeight: '80px', overflowY: 'auto',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: input.trim() && !loading ? C.blue : C.border,
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              {loading
                ? <Loader size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={16} color="#fff" />
              }
            </button>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}