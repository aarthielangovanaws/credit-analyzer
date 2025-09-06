import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Statements from './pages/Statements.jsx'
import Rewards from './pages/Rewards.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import Support from './pages/Support.jsx'
import Chatbot from './components/Chatbot.jsx'

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [chatOpen, setChatOpen] = useState(false)
  const [context, setContext] = useState(null)

  function openTab(tab) {
    setActive(tab)
    // if user opens statements, set chatbot context to "statements"
    if(tab === 'statements') {
      setContext({ page: 'statements' })
      // open chat after a short delay for gentle UX
      setTimeout(()=> setChatOpen(true), 450)
    } else {
      setContext({ page: tab })
    }
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={openTab} onChat={() => setChatOpen(true)} />
      <main className="content">
        <header className="topbar">
          <h1>Welcome back 👋</h1>
          <div className="top-actions">
            <button className="btn ghost">Help</button>
            <button className="btn primary">New Upload</button>
          </div>
        </header>

        <div className="page-body">
          {active === 'dashboard' && <Dashboard />}
          {active === 'transactions' && <Transactions />}
          {active === 'statements' && <Statements />}
          {active === 'rewards' && <Rewards />}
          {active === 'profile' && <Profile />}
          {active === 'settings' && <Settings />}
          {active === 'support' && <Support />}
        </div>
      </main>

      <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} context={context} />
    </div>
  )
}
