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
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="p-6 rounded-lg shadow-md bg-white">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
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
        <div className="space-y-6">
          {statements.map((statement) => (
            <div
              key={statement.statement_id}
              className="p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-xl text-gray-800">
                    {formatMonthYear(statement.month)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {statement.type || "Credit Card Statement"} • ₹{statement.total_spent?.toLocaleString("en-IN")}
                  </div>
                </div>
                
                <button
                  onClick={() => handleGetSuggestions(statement.statement_id, statement.month)}
                  disabled={loadingSuggestions[statement.statement_id]}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    loadingSuggestions[statement.statement_id] 
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                      : suggestions[statement.statement_id] 
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {loadingSuggestions[statement.statement_id] 
                    ? "Loading..." 
                    : suggestions[statement.statement_id] 
                      ? "Hide Suggestions" 
                      : "Get Suggestions"}
                </button>
              </div>
              
              {/* Suggestions */}
              {suggestions[statement.statement_id] && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <strong className="text-blue-800">Financial Suggestions</strong>
                  </div>
                  <p className="text-blue-700">
                    {typeof suggestions[statement.statement_id] === "string"
                      ? suggestions[statement.statement_id]
                      : JSON.stringify(suggestions[statement.statement_id])}
                  </p>
                </div>
              )}
              
              {/* Errors */}
              {suggestionErrors[statement.statement_id] && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <strong className="text-red-800">Error Loading Suggestions</strong>
                  </div>
                  <p className="text-red-700 mb-3">{suggestionErrors[statement.statement_id]}</p>
                  <button
                    onClick={() => handleGetSuggestions(statement.statement_id, statement.month)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Try Again
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
