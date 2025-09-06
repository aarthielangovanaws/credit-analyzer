import React from 'react'

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'transactions', label: 'Transactions', icon: '🧾' },
  { id: 'statements', label: 'Statements', icon: '📄' },
  { id: 'rewards', label: 'Rewards & Offers', icon: '🎁' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'support', label: 'Support', icon: '❓' },
]

export default function Sidebar({ active, onChange, onChat }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-dot" />
        <div className="brand-text">Credit Coach</div>
      </div>

      <nav className="nav">
        {items.map(i => (
          <button
            key={i.id}
            className={i.id === active ? 'nav-item active' : 'nav-item'}
            onClick={() => onChange(i.id)}
          >
            <span className="nav-ico">{i.icon}</span>
            <span>{i.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="chat-fab" onClick={onChat}>💬 Chat</button>
      </div>
    </aside>
  )
}
