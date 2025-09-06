import React, { useEffect, useRef, useState } from 'react'

export default function Chatbot({ open, onClose, context }) {
  const [msgs, setMsgs] = useState([
    { sender: 'bot', text: 'Hi! I’m your Credit Coach. How can I help today?' }
  ])
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if(context?.page === 'statements' && open) {
      // push contextual suggestions
      setTimeout(() => {
        setMsgs(m => [...m,
          { sender: 'bot', text: `I noticed you opened Monthly Statements — you spent ₹41,250 this month.` },
          { sender: 'bot', text: 'You qualify for 5% cashback on groceries and a ₹500 welcome reward. Want to see offers?' }
        ])
      }, 300)
    }
  }, [context, open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, open])

  function send() {
    if(!text.trim()) return
    const user = { sender: 'you', text: text.trim() }
    setMsgs(m => [...m, user])
    setText('')
    setTimeout(() => {
      setMsgs(m => [...m, { sender: 'bot', text: smartReply(text) }])
    }, 500)
  }

  if(!open) return null

  return (
    <div className="chat-popup" role="dialog" aria-modal="true">
      <div className="chat-header">
        <div>Chatbot</div>
        <button className="btn ghost small" onClick={onClose}>✕</button>
      </div>
      <div className="chat-list" ref={listRef}>
        {msgs.map((m,i) => (
          <div key={i} className={m.sender === 'you' ? 'bubble you' : 'bubble bot'}>{m.text}</div>
        ))}
      </div>
      <div className="chat-input">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' ? send() : null} />
        <button className="btn primary" onClick={send}>Send</button>
      </div>
    </div>
  )
}

function smartReply(q) {
  const s = (q||'').toLowerCase()
  if(s.includes('offer')||s.includes('cashback')) return 'You can activate 5% cashback on groceries — would you like me to apply it to your card?'
  if(s.includes('save')||s.includes('tips')) return 'Try setting an auto-transfer of 5% of your salary to savings and cap dining to ₹8,000.'
  if(s.includes('reward')||s.includes('points')) return 'You have ₹75 in rewards. Redeem for statement credit or partner vouchers.'
  return "Good question — I can help with statements, offers, or tips. Try asking about 'cashback' or 'savings'."
}
