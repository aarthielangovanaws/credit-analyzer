import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import StatementsPage from "./components/StatementsPage";
import Chatbot from "./components/Chatbot";
import Login from "./pages/Login";

export default function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotContext, setChatbotContext] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("statements");

  // Check if user is already logged in on app load
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("userEmail");
    if (storedEmail) {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    window.triggerChatbot = (context, payload) => {
      setChatbotOpen(true);
      setChatbotContext({ context, payload });
    };
    window.closeChatbot = () => setChatbotOpen(false);
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("userEmail");
    // Update state to logged out
    setLoggedIn(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "statements") {
      setChatbotContext({ context: "statements" });
      setTimeout(() => setChatbotOpen(true), 450);
    } else {
      setChatbotContext({ context: tab });
    }
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar active={activeTab} onChange={handleTabChange} />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto transition-all duration-300 bg-gradient-to-br from-blue-50 via-purple-50 to-purple-100">
          <div className="p-4 flex justify-between items-center bg-white shadow-sm">
            <h1 className="text-2xl font-bold">Welcome back 👋</h1>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          {activeTab === "statements" && <StatementsPage />}
          {/* Add other tab components here as needed */}
        </div>
        {chatbotOpen && (
          <div className="w-[550px] border-l shadow-2xl bg-gradient-to-b from-cyan-100 via-blue-100 to-blue-200 bg-opacity-90 backdrop-blur-md flex flex-col">
            <Chatbot context={chatbotContext?.context} payload={chatbotContext?.payload} />
          </div>
        )}
      </main>
    </div>
  );
}
