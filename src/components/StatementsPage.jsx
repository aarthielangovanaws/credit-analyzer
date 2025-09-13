import React, { useState, useEffect } from 'react';

export default function StatementsPage() {
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

  const handleGetSuggestions = async (statementId, month) => {
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Monthly Statements</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="p-4 rounded-lg shadow-md bg-white">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Monthly Statements</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monthly Statements</h1>
      
      {statements.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No statements found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statements.map((statement) => (
            <div
              key={statement.statement_id}
              className="p-4 rounded-lg shadow-md bg-white hover:bg-blue-50 transition cursor-pointer relative"
            >
              <div className="font-semibold text-lg">{statement.month}</div>
              <div className="text-sm text-gray-600 mb-2">
                {statement.type || "Statement"} • ₹{statement.total_spent?.toLocaleString("en-IN")}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGetSuggestions(statement.statement_id, statement.month);
                }}
                disabled={loadingSuggestions[statement.statement_id]}
                className={`text-sm ${
                  loadingSuggestions[statement.statement_id] 
                    ? "text-gray-400 cursor-not-allowed" 
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                {loadingSuggestions[statement.statement_id] 
                  ? "Loading..." 
                  : suggestions[statement.statement_id] 
                    ? "Hide Suggestions" 
                    : "Get Suggestions"}
              </button>
              
              {/* Suggestions */}
              {suggestions[statement.statement_id] && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <strong className="block text-sm mb-1">Suggestions:</strong>
                  <p className="text-xs text-gray-600">
                    {typeof suggestions[statement.statement_id] === "string"
                      ? suggestions[statement.statement_id]
                      : JSON.stringify(suggestions[statement.statement_id])}
                  </p>
                </div>
              )}
              
              {/* Errors */}
              {suggestionErrors[statement.statement_id] && (
                <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                  <strong className="block text-sm mb-1 text-red-700">Error:</strong>
                  <p className="text-xs text-red-600">{suggestionErrors[statement.statement_id]}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetSuggestions(statement.statement_id, statement.month);
                    }}
                    className="mt-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
