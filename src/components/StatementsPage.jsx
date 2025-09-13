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

  // Function to format date from "2025-08-10" to "September 2025"
  const formatMonthYear = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original if formatting fails
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Monthly Statements</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="p-4 rounded-lg shadow-sm bg-white h-32">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Monthly Statements</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Monthly Statements</h1>
      
      {statements.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No statements found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statements.map((statement) => (
            <div
              key={statement.statement_id}
              className="p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-all duration-200 h-32 flex flex-col justify-between"
            >
              <div>
                <div className="font-semibold text-gray-800 text-sm mb-1">
                  {formatMonthYear(statement.month)}
                </div>
                <div className="text-xs text-gray-600">
                  ₹{statement.total_spent?.toLocaleString("en-IN")}
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleGetSuggestions(statement.statement_id, statement.month)}
                  disabled={loadingSuggestions[statement.statement_id]}
                  className={`text-xs px-2 py-1 rounded ${
                    loadingSuggestions[statement.statement_id] 
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                      : suggestions[statement.statement_id] 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {loadingSuggestions[statement.statement_id] 
                    ? "..." 
                    : suggestions[statement.statement_id] 
                      ? "Hide" 
                      : "Suggest"}
                </button>
              </div>
              
              {/* Suggestions Modal */}
              {suggestions[statement.statement_id] && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">
                        Suggestions for {formatMonthYear(statement.month)}
                      </h3>
                      <button 
                        onClick={() => setSuggestions((prev) => ({ ...prev, [statement.statement_id]: null }))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {typeof suggestions[statement.statement_id] === "string"
                        ? suggestions[statement.statement_id]
                        : JSON.stringify(suggestions[statement.statement_id])}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Errors Modal */}
              {suggestionErrors[statement.statement_id] && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-red-600">Error</h3>
                      <button 
                        onClick={() => setSuggestionErrors((prev) => ({ ...prev, [statement.statement_id]: null }))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-sm text-red-600 mb-4">
                      {suggestionErrors[statement.statement_id]}
                    </div>
                    <button
                      onClick={() => handleGetSuggestions(statement.statement_id, statement.month)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
