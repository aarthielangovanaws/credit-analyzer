
import React, { useState, useEffect, useRef } from 'react';

export default function Chatbot({ context, payload }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // When context or payload changes, push appropriate assistant message
  useEffect(() => {
    if(!context) return;
    let msg = "";
    if(context === "dashboard") msg = "Here’s a summary of your finances this month...";
    else if(context === "profile") msg = "Would you like to update your personal details or preferences?";
    else if(context === "support") msg = "How can I help you today?";
    else if(context === "chat") msg = "Hi 👋 I’m your credit assistant. What would you like help with today?";
    else if(context === "statements") msg = "Here are your monthly statements. Select a month to get insights.";
    else if(context === "statement-month" && payload?.month) {
      (async () => {
        try {
          const res = await fetch(`/api/statements/analyze/${encodeURIComponent(payload.month)}`);
          const data = await res.json();
          const m = data.message || "Here are your insights for " + payload.month;
          setMessages(prev => [...prev, { from: "assistant", text: m }]);
        } catch(e) {
          setMessages(prev => [...prev, { from: "assistant", text: "Sorry, I couldn't fetch insights for " + payload.month }]);
        }
      })();
      return;
    }
    if(msg) setMessages(prev => [...prev, { from: "assistant", text: msg }]);
  }, [context, payload]);

  useEffect(() => {
    if(messagesEndRef.current){
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if(!input.trim()) return;
    const userMsg = { from: "user", text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    try {
      const res = await fetch('https://wad3lzse8k.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.text, email: sessionStorage.getItem("userEmail") })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: "assistant", text: data.response || 'No response from server' }]);
    } catch (e) {
      setMessages(prev => [...prev, { from: "assistant", text: 'Error fetching response' }]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <span>💬 Chat Assistant</span>
        <button onClick={()=>window.closeChatbot()} className="text-white text-lg font-bold">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {messages.map((m,i)=>(
          <div key={i} className={`my-2 flex ${m.from==="user"?"justify-end":"justify-start"}`}>
            <div className={`px-3 py-2 rounded-lg max-w-[80%] font-semibold ${m.from==="user"?"bg-blue-600 text-white":"bg-gray-200 text-black"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t flex gap-2">
        <input 
          type='text'
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter') handleSend();}}
          placeholder='Type your question...'
          className="flex-1 p-2 border rounded-lg"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Send</button>
      </div>
    </div>
  );
}
