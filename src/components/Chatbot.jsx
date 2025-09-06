import React, { useEffect, useRef, useState } from 'react'

export default function Chatbot({ open, onClose, context }) {
  const [msgs, setMsgs] = useState([
    { sender: 'bot', text: 'Hi! I’m your Credit Coach. How can I help today?' }
  ])
  const [text, setText] = useState('')
  const listRef = useRef(null)

  // ✅ Read API URL & Key from environment variables
  const API_URL = 'https://ksp4y6kvui.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda'
  const API_KEY = 'uZK1hEfQgl14nn9IU5GN88tT7QqdsbNt8IKDTVdn'

  useEffect(() => {
    if (context?.page === 'statements' && open) {
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

  async function send() {
    if (!text.trim()) return
    const user = { sender: 'you', text: text.trim() }
    setMsgs(m => [...m, user])
    const userInput = text.trim()
    setText('')

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { "x-api-key": API_KEY } : {}) // Add API key if defined
        },
        body: JSON.stringify({ message: userInput })
      })

      const data = await res.json()

      setMsgs(m => [...m, { sender: 'bot', text: data.reply || "No response from server." }])
    } catch (err) {
      setMsgs(m => [...m, { sender: 'bot', text: `Error: ${err.message}` }])
    }
  }

  if (!open) return null

  return (
    <div className="chat-popup" role="dialog" aria-modal="true">
      <div className="chat-header">
        <div>Chatbot</div>
        <button className="btn ghost small" onClick={onClose}>✕</button>
      </div>
      <div className="chat-list" ref={listRef}>
        {msgs.map((m, i) => (
          <div key={i} className={m.sender === 'you' ? 'bubble you' : 'bubble bot'}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => e.key === 'Enter' ? send() : null}
        />
        <button className="btn primary" onClick={send}>Send</button>
      </div>
    </div>
  )
}
