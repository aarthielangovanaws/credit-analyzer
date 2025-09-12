import React, { useState, useEffect } from 'react';

export default function Statements() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});
  const [suggestionErrors, setSuggestionErrors] = useState({});

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    try {
      const response = await fetch(
        "https://wad3lzse8k.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda/statements",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionStorage.getItem("userEmail") }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setStatements(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch statements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (statementId, month) => {
    if (loadingSuggestions[statementId]) return;

    if (suggestions[statementId]) {
      setSuggestions((prev) => ({ ...prev, [statementId]: null }));
      setSuggestionErrors((prev) => ({ ...prev, [statementId]: null }));
      return;
    }

    setLoadingSuggestions((prev) => ({ ...prev, [statementId]: true }));
    setSuggestionErrors((prev) => ({ ...prev, [statementId]: null }));

    try {
      const response = await fetch(
        "https://wad3lzse8k.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda/statements/suggestions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sessionStorage.getItem("userEmail"),
            month,
          }),
        }
      );

      if (!response.ok) throw new Error(`Failed to fetch suggestions: HTTP ${response.status}`);

      const data = await response.json();
      setSuggestions((prev) => ({ ...prev, [statementId]: data }));
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestionErrors((prev) => ({ ...prev, [statementId]: err.message }));
    } finally {
      setLoadingSuggestions((prev) => ({ ...prev, [statementId]: false }));
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

        {/* Scrollable data area */}
        <div className="table-container">
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
                    <div>{statement.type || "Statement"}</div>
                    <div>₹{statement.total_spent?.toLocaleString("en-IN")}</div>
                    <div
                      onClick={() => handleDownload(statement.statement_id, statement.month)}
                      style={{
                        cursor: loadingSuggestions[statement.statement_id] ? "not-allowed" : "pointer",
                        color: loadingSuggestions[statement.statement_id] ? "#6c757d" : "#007bff",
                        opacity: loadingSuggestions[statement.statement_id] ? 0.6 : 1,
                      }}
                      title={loadingSuggestions[statement.statement_id] ? "Loading..." : "Get suggestions"}
                    >
                      {loadingSuggestions[statement.statement_id] ? "⏳" : "💬"}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {suggestions[statement.statement_id] && (
                    <div className="suggestions-row success">
                      <div className="suggestions-content">
                        <strong>Suggestions for {statement.month}:</strong>
                        <p>
                          {typeof suggestions[statement.statement_id] === "string"
                            ? suggestions[statement.statement_id]
                            : JSON.stringify(suggestions[statement.statement_id])}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {suggestionErrors[statement.statement_id] && (
                    <div className="suggestions-row error">
                      <div className="suggestions-content">
                        <strong>Error loading suggestions for {statement.month}:</strong>
                        <p>{suggestionErrors[statement.statement_id]}</p>
                        <button
                          onClick={() => handleDownload(statement.statement_id, statement.month)}
                          className="retry-btn"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="row">
                <div colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                  No statements found.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline CSS */}
      <style jsx>{`
        .table-container {
          max-height: calc(100vh - 188px);
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }
        .table {
          width: 100%;
        }
        .row.head {
          position: sticky;
          top: 0;
          background: #f8f9fa;
          font-weight: bold;
          z-index: 1;
        }
        .suggestions-row {
          padding: 1rem;
          margin: 0.5rem 0;
          border-radius: 0 4px 4px 0;
          border-left: 4px solid;
        }
        .suggestions-row.success {
          background-color: #f8f9fa;
          border-color: #28a745;
        }
        .suggestions-row.error {
          background-color: #f8d7da;
          border-color: #dc3545;
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
          margin: 0 0 0.5rem 0;
          color: #6c757d;
          white-space: pre-wrap;
        }
        .retry-btn {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .retry-btn:hover {
          background-color: #c82333;
        }
        .error {
          color: #dc3545;
        }
      `}</style>
    </div>
  );
}
