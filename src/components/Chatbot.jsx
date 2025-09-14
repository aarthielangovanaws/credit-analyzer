import React, { useState, useEffect, useRef } from 'react';

export default function Chatbot({ context, payload }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const isInitialLoad = useRef(true);
  
  // Define context-specific suggestions
  const suggestions = {    
    chat: [
      "Minimum payment to avoid interest?",
      "Any suspicious transactions?",
      "Spending summary please!"
    ],
    "statement-month": [
      "Minimum payment to avoid interest?",
      "Any suspicious transactions?",
      "Spending summary please!"
    ]
  };

  // When context or payload changes, push appropriate assistant message
  useEffect(() => {
    if(!context) return;
    
    // Only show welcome message on initial load
    if (isInitialLoad.current) {
      let msg = (
        <div>
          <div>😴 Too tired to read this statement? Same.</div>
          <div />
          <div>Fear not! I'm Credit Yoda - here to decode your spending mysteries 🔍</div>
        </div>
      );
      
      if(msg) setMessages(prev => [...prev, { from: "assistant", text: msg }]);
      isInitialLoad.current = false;
    }
  }, [context, payload]);

  useEffect(() => {
    if(messagesEndRef.current){
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if(!textToSend) return;
    
    const userMsg = { from: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    
    if (!messageText) {
      setInput(""); // Only clear input if it wasn't a suggestion click
    }
    
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

  const handleSuggestionClick = (suggestion) => {
    // Append the month to the suggestion if we're in statement-month context
    let finalSuggestion = suggestion;
    if (context === "statement-month" && payload?.month) {
      // Format the month for display
      const formatMonthYear = (dateString) => {
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        } catch (error) {
          return dateString;
        }
      };
      
      const formattedMonth = formatMonthYear(payload.month);
      
      // Check if the suggestion already ends with a question mark
      if (suggestion.endsWith('?')) {
        // Insert the month before the question mark
        finalSuggestion = suggestion.slice(0, -1) + ` in ${formattedMonth}?`;
      } else {
        // Just append the month
        finalSuggestion = suggestion + ` for ${formattedMonth}`;
      }
    }
    
    handleSend(finalSuggestion);
  };

  // Check if we should show suggestions (only after the last assistant message)
  const shouldShowSuggestions = () => {
    if (messages.length === 0) return true;
    const lastMessage = messages[messages.length - 1];
    return lastMessage.from === "assistant";
  };

  // Format month for display in suggestions
  const formatMonthYear = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <span>💬 Credit Yoda</span>
        <button onClick={() => window.closeChatbot && window.closeChatbot()} className="text-white text-lg font-bold">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`my-2 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`px-3 py-2 rounded-lg max-w-[80%] font-semibold ${m.from === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}>
              {typeof m.text === 'string' ? m.text : m.text}
            </div>
          </div>
        ))}
        
        {/* Suggestions */}
        {shouldShowSuggestions() && suggestions[context] && (
          <div className="mt-3 mb-2">
            <p className="text-xs text-gray-500 mb-2">Ask me:</p>
            <div className="flex flex-col gap-2">
              {suggestions[context].map((suggestion, index) => {
                // Format the suggestion text to include the month if applicable
                let displaySuggestion = suggestion;
                if (context === "statement-month" && payload?.month) {
                  const formattedMonth = formatMonthYear(payload.month);
                  if (suggestion.endsWith('?')) {
                    displaySuggestion = suggestion.slice(0, -1) + ` in ${formattedMonth}?`;
                  } else {
                    displaySuggestion = suggestion + ` for ${formattedMonth}`;
                  }
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-left w-full whitespace-normal break-words"
                  >
                    {displaySuggestion}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2 bg-white">
        <input 
          type='text'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key === 'Enter') handleSend(); }}
          placeholder='Type your question...'
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={() => handleSend()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
