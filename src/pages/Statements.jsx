import React, { useState, useEffect } from 'react';

export default function Statements() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    try {
      // Replace with your actual API Gateway endpoint
      const response = await fetch('https://wad3lzse8k.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda/statements', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: sessionStorage.getItem("userEmail") }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStatements(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch statements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (statementId, month) => {
     const response = await fetch('https://wad3lzse8k.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda/statements/suggestions', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: sessionStorage.getItem("userEmail"), month }),
      });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
  };

  if (loading) {
    return (
      <div>
        <h2>Monthly Statements</h2>
        <div className="card">
          <p>Loading your statements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Monthly Statements</h2>
        <div className="card">
          <p className="error">Error loading statements: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Monthly Statements</h2>
      <div className="card">
        <p className="muted">Statements are generated every month.</p>
        <div className="table">
          <div className="row head">
            <div>Month</div>
            <div>Type</div>
            <div>Amount</div>
            <div></div>
          </div>
          
          {statements.length > 0 ? (
            statements.map((statement) => (
              <div key={statement.statement_id} className="row">
                <div>{statement.month}</div>
                <div>{statement.type || 'Statement'}</div>
                <div>₹{statement.total_spent?.toLocaleString('en-IN')}</div>
                <div onClick={() => handleDownload(statement.statement_id, statement.month)}> 💬 </div>
              </div>
            ))
          ) : (
            <div className="row">
              <div colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                No statements found.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
