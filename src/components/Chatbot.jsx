import React, { useState, useEffect, useRef } from 'react';

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1">
      <span className="ml-2 italic text-gray-500">Credit Yoda is thinking </span>
      <span
        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></span>
      <span
        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></span>
      <span
        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></span>      
    </div>
  );
}

export default function Chatbot({ context, payload }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
      "Any unusual transactions?",
      "Spending summary please!"
    ]
  };

  // Friendly fallback responses if API fails
  const fallbackResponses = [
    "Even Master Yoda gets confused sometimes! 🔮 Could you try asking differently?"
  ];

  const getRandomFallback = () => {
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  // Show welcome message only once
  useEffect(() => {
    if (!context) return;
    if (isInitialLoad.current) {
      const msg = (
        <div>
          <div>😴 Too tired to read this statement? Same.</div>
          <br />
          <div>Fear not! I'm Credit Yoda - here to decode your spending mysteries 🔍</div>
        </div>
      );
      setMessages(prev => [...prev, { from: "assistant", text: msg }]);
      isInitialLoad.current = false;
    }
  }, [context, payload]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    const userMsg = { from: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);

    if (!messageText) setInput("");

    // Show temporary "thinking" message
    setLoading(true);
    setMessages(prev => [
      ...prev,
      { from: "assistant", text: <TypingIndicator />, isTemp: true }
    ]);

    try {
      const res = await fetch(
        "https://wad3lzse8k.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda/query",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: userMsg.text,
            email: sessionStorage.getItem("userEmail")
          })
        }
      );

      const data = await res.json();
      const botReply = data.response?.trim();

      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].isTemp) {
          newMsgs.pop();
        }
        return [
          ...newMsgs,
          { from: "assistant", text: botReply || getRandomFallback() }
        ];
      });
    } catch (e) {
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].isTemp) {
          newMsgs.pop();
        }
        return [...newMsgs, { from: "assistant", text: getRandomFallback() }];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    let finalSuggestion = suggestion;
    if (context === "statement-month" && payload?.month) {
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
      if (suggestion.endsWith("?")) {
        finalSuggestion = suggestion.slice(0, -1) + ` in ${formattedMonth}?`;
      } else {
        finalSuggestion = suggestion + ` for ${formattedMonth}`;
      }
    }
    handleSend(finalSuggestion);
  };

  const shouldShowSuggestions = () => {
    if (messages.length === 0) return true;
    const lastMessage = messages[messages.length - 1];
    return lastMessage.from === "assistant" && !loading;
  };

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
      <div className="bg-[#fbc600] text-black p-3 flex justify-between items-center">
        <span>💬 Credit Yoda</span>
        <button
          onClick={() => window.closeChatbot && window.closeChatbot()}
          className="text-black text-lg font-bold"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`my-2 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-[80%] font-semibold ${
                m.from === "user"
                  ? "bg-[#fbc600] text-black"
                  : "bg-gray-200 text-black"
              }`}
            >
              {typeof m.text === "string" ? m.text : m.text}
            </div>
          </div>
        ))}

        {/* Suggestions */}
        {shouldShowSuggestions() && suggestions[context] && (
          <div className="mt-3 mb-2">
            <p className="text-xs text-gray-500 mb-2">Ask me:</p>
            <div className="flex flex-col gap-2">
              {suggestions[context].map((suggestion, index) => {
                let displaySuggestion = suggestion;
                if (context === "statement-month" && payload?.month) {
                  const formattedMonth = formatMonthYear(payload.month);
                  if (suggestion.endsWith("?")) {
                    displaySuggestion =
                      suggestion.slice(0, -1) + ` in ${formattedMonth}?`;
                  } else {
                    displaySuggestion = suggestion + ` for ${formattedMonth}`;
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm bg-[#fbc600]/20 px-4 py-2 rounded-lg hover:bg-[#fbc600]/30 transition-colors text-left w-full whitespace-normal break-words"
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
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type your question..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fbc600]"
        />
        <button
          onClick={() => handleSend()}
          className="bg-[#fbc600] text-black px-4 py-2 rounded-lg hover:bg-[#e0ad00] transition-colors"
          disabled={!input.trim() || loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
