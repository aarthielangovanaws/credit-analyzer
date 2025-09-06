import React from 'react'

export default function Statements() {
  return (
    <div>
      <h2>Monthly Statements</h2>
      <div className="card">
        <p className="muted">Statements are generated every month. You can download PDF or view details.</p>
        <div className="table">
          <div className="row head"><div>Month</div><div>Type</div><div>Amount</div><div></div></div>
          <div className="row"><div>Aug 2025</div><div>Statement</div><div>₹41,250</div><div><button className="btn">Download</button></div></div>
          <div className="row"><div>Jul 2025</div><div>Statement</div><div>₹38,990</div><div><button className="btn">Download</button></div></div>
          <div className="row"><div>Jun 2025</div><div>Statement</div><div>₹50,210</div><div><button className="btn">Download</button></div></div>
        </div>
      </div>
    </div>
  )
}
