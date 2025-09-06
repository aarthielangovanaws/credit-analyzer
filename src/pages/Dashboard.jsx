import React from 'react'

export default function Dashboard() {
  return (
    <div className="dashboard-grid">
      <section className="grid-3">
        <div className="card stat">
          <div className="stat-label">Your Credit Score</div>
          <div className="stat-value">720 <span className="badge ok">Good</span></div>
        </div>
        <div className="card stat">
          <div className="stat-label">Monthly Spend</div>
          <div className="stat-value">₹41,250</div>
          <progress max="100" value="65"></progress>
        </div>
        <div className="card stat">
          <div className="stat-label">Savings</div>
          <div className="stat-value">₹5,200</div>
          <progress max="100" value="52"></progress>
        </div>
      </section>

      <section className="card">
        <h3>Monthly Statements</h3>
        <div className="chart-placeholder">[Bar chart placeholder]</div>
        <p className="muted">You spent ₹41,250 this month. Chatbot can suggest offers when you open Statements.</p>
      </section>

      <section className="card">
        <h3>Recent Transactions</h3>
        <div className="table">
          <div className="row head"><div>Date</div><div>Merchant</div><div>Amount</div></div>
          <div className="row"><div>Jun 23</div><div>Grocery Store</div><div>₹150</div></div>
          <div className="row"><div>Jun 20</div><div>Electricity Bill</div><div>₹75</div></div>
          <div className="row"><div>Jun 18</div><div>Restaurant</div><div>₹45</div></div>
        </div>
      </section>
    </div>
  )
}
