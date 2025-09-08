import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Statements from "./pages/Statements.jsx";
import Rewards from "./pages/Rewards.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Support from "./pages/Support.jsx";
import Chatbot from "./components/Chatbot.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  const [active, setActive] = useState("statements");
  const [chatOpen, setChatOpen] = useState(false);
  const [context, setContext] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  // Check if user is already logged in on app load
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("userEmail");
    if (storedEmail) {
      setLoggedIn(true);
    }
  }, []);

  function openTab(tab) {
    setActive(tab);
    if (tab === "statements") {
      setContext({ page: "statements" });
      setTimeout(() => setChatOpen(true), 450);
    } else {
      setContext({ page: tab });
    }
  }

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("userEmail");
    // Update state to logged out
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={openTab} onChat={() => setChatOpen(true)} />
      <main className="content">
        <header className="topbar flex items-center justify-between">
          <h1>Welcome back 👋</h1>
          <div className="top-actions flex gap-2">
            <button
              className="btn danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="page-body">
          {active === "statements" && <Statements />}
        </div>
      </main>

      <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} context={context} />
    </div>
  );
}
