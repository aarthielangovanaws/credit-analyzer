import React, { useState, useEffect } from 'react';

export default function Statements() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});

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
    // If suggestions already exist for this statement, toggle visibility
    if (suggestions[statementId]) {
      setSuggestions(prev => ({ ...prev, [statementId]: null }));
      return;
    }

    setLoadingSuggestions(prev => ({ ...prev, [statementId]: true }));

    try {
      const response = await fetch('https://wad3lzse8k.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda/statements/suggestions', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: sessionStorage.getItem("userEmail"), 
          month 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(prev => ({ ...prev, [statementId]: data }));
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch suggestions:', err);
      setSuggestions(prev => ({ ...prev, [statementId]: 'Error loading suggestions' }));
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [statementId]: false }));
    }
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
            <div>Actions</div>
          </div>
          
          {statements.length > 0 ? (
            statements.map((statement) => (
              <div key={statement.statement_id}>
                <div className="row">
                  <div>{statement.month}</div>
                  <div>{statement.type || 'Statement'}</div>
                  <div>₹{statement.total_spent?.toLocaleString('en-IN')}</div>
                  <div 
                    onClick={() => handleDownload(statement.statement_id, statement.month)}
                    style={{ cursor: 'pointer', color: '#007bff' }}
                    title="Get suggestions"
                  >
                    {loadingSuggestions[statement.statement_id] ? '⏳' : '💬'}
                  </div>
                </div>
                
                {/* Suggestions display area */}
                {suggestions[statement.statement_id] && (
                  <div className="suggestions-row">
                    <div className="suggestions-content">
                      <strong>Suggestions for {statement.month}:</strong>
                      <p>{typeof suggestions[statement.statement_id] === 'string' 
                          ? suggestions[statement.statement_id] 
                          : JSON.stringify(suggestions[statement.statement_id])}
                      </p>
                    </div>
                  </div>
                )}
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

      <style jsx>{`
        .suggestions-row {
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 1rem;
          margin: 0.5rem 0;
          border-radius: 0 4px 4px 0;
        }
        
        .suggestions-content {
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .suggestions-content strong {
          color: #495057;
          display: block;
          margin-bottom: 0.5rem;
        }
        
        .suggestions-content p {
          margin: 0;
          color: #6c757d;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}
