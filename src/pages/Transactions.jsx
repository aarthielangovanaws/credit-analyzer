import React from 'react'

export default function Transactions() {
  return (
    <div>
      <h2>Transactions</h2>
      <div className="card">
        <div className="table">
          <div className="row head"><div>Date</div><div>Merchant</div><div>Category</div><div>Amount</div></div>
          <div className="row"><div>Jun 23</div><div>Grocery Store</div><div>Groceries</div><div>₹150</div></div>
          <div className="row"><div>Jun 20</div><div>Electricity</div><div>Utilities</div><div>₹75</div></div>
          <div className="row"><div>Jun 18</div><div>Restaurant</div><div>Dining</div><div>₹45</div></div>
        </div>
      </div>
    </div>
  )
}
