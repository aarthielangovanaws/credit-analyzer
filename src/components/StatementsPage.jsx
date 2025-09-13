import React, { useState, useEffect } from 'react';

export default function StatementsPage() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleGetSuggestions = (month) => {
    // Trigger the chatbot with statement context
    if (window.triggerChatbot) {
      window.triggerChatbot("statement-month", { month });
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
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="p-3 rounded bg-white shadow-sm h-16 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
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
        <div className="space-y-2">
          {statements.map((statement) => (
            <div
              key={statement.statement_id}
              className="flex items-center justify-between p-3 rounded bg-white shadow-sm hover:shadow-md transition-shadow h-16"
            >
              <div>
                <div className="font-medium text-gray-800">
                  {formatMonthYear(statement.month)}
                </div>
                <div className="text-sm text-gray-600">
                  Amount: ₹{statement.total_spent?.toLocaleString("en-IN")}
                </div>
              </div>
              
              <button
                onClick={() => handleGetSuggestions(statement.month)}
                className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200 transition-colors"
              >
                Get Suggestions
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
