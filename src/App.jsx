import React, { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Statements from "./pages/Statements.jsx";
import Rewards from "./pages/Rewards.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Support from "./pages/Support.jsx";
import Chatbot from "./components/Chatbot.jsx";
import Login from "./pages/Login.jsx"; // ✅ login page

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [context, setContext] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false); // ✅ auth state

  function openTab(tab) {
    setActive(tab);
    if (tab === "statements") {
      setContext({ page: "statements" });
      setTimeout(() => setChatOpen(true), 450);
    } else {
      setContext({ page: tab });
    }
  }

  // ✅ Show Login if not authenticated
  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  // ✅ App Shell after login
  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={openTab} onChat={() => setChatOpen(true)} />
      <main className="content">
        <header className="topbar flex items-center justify-between">
          <h1>Welcome back 👋</h1>
          <div className="top-actions flex gap-2">
            <button className="btn ghost">Help</button>
            <button className="btn primary">New Upload</button>
            {/* ✅ Logout Button */}
            <button
              className="btn danger"
              onClick={() => setLoggedIn(false)}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="page-body">
          {active === "dashboard" && <Dashboard />}
          {active === "transactions" && <Transactions />}
          {active === "statements" && <Statements />}
          {active === "rewards" && <Rewards />}
          {active === "profile" && <Profile />}
          {active === "settings" && <Settings />}
          {active === "support" && <Support />}
        </div>
      </main>

      <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} context={context} />
    </div>
  );
}
