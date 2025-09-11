import React, { useState, useEffect } from "react";

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

      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: HTTP ${response.status}`);
      }

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
        <h2 className="text-xl font-bold mb-4">Monthly Statements</h2>
        <div className="bg-white rounded-xl shadow p-6 text-gray-500">
          Loading your statements...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Monthly Statements</h2>
        <div className="bg-red-100 text-red-700 rounded-xl shadow p-6">
          Error loading statements: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Monthly Statements</h2>
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-sm text-gray-500 mb-4">
          Statements are generated every month.
        </p>

        <div className="divide-y divide-gray-200">
          <div className="grid grid-cols-4 font-medium text-gray-600 pb-2">
            <div>Month</div>
            <div>Type</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>

          {statements.length > 0 ? (
            statements.map((s) => (
              <div key={s.statement_id} className="py-3">
                <div className="grid grid-cols-4 items-center">
                  <div>{s.month}</div>
                  <div>{s.type || "Statement"}</div>
                  <div>₹{s.total_spent?.toLocaleString("en-IN")}</div>
                  <button
                    onClick={() => handleDownload(s.statement_id, s.month)}
                    disabled={loadingSuggestions[s.statement_id]}
                    className={`text-sm font-medium ${
                      loadingSuggestions[s.statement_id]
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-indigo-600 hover:underline"
                    }`}
                  >
                    {loadingSuggestions[s.statement_id] ? "⏳ Loading..." : "💬 Get Suggestions"}
                  </button>
                </div>

                {suggestions[s.statement_id] && (
                  <div className="mt-2 bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <strong className="block text-green-700 mb-1">
                      Suggestions for {s.month}:
                    </strong>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {typeof suggestions[s.statement_id] === "string"
                        ? suggestions[s.statement_id]
                        : JSON.stringify(suggestions[s.statement_id], null, 2)}
                    </p>
                  </div>
                )}

                {suggestionErrors[s.statement_id] && (
                  <div className="mt-2 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                    <strong className="block text-red-700 mb-1">
                      Error loading suggestions for {s.month}:
                    </strong>
                    <p className="text-sm text-gray-700 mb-2">
                      {suggestionErrors[s.statement_id]}
                    </p>
                    <button
                      onClick={() => handleDownload(s.statement_id, s.month)}
                      className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              No statements found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
