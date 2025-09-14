import React, { useState, useEffect } from "react";

export default function StatementsPage() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

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

  const fetchTransactions = async (month) => {
    setSelectedMonth(month);
    setTransactions([]);
    setLoadingTx(true);

    try {
      const response = await fetch(
        "https://wad3lzse8k.execute-api.us-east-1.amazonaws.com/default/credit-analyzer-yoda/statements/transactions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sessionStorage.getItem("userEmail"),
            month,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setTransactions(data);
      
      // Trigger chatbot after transactions are loaded
      if (window.triggerChatbot && typeof window.triggerChatbot === "function") {
        window.triggerChatbot("chat");
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoadingTx(false);
    }
  };

  // Format month
  const formatMonthYear = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Monthly Statements</h1>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="p-3 rounded bg-white shadow-sm h-16 animate-pulse"
            >
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
        <>
          {/* Statement cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statements.map((statement) => (
              <div
                key={statement.statement_id}
                onClick={() => fetchTransactions(statement.month)}
                className={`p-4 rounded-lg shadow-md bg-white hover:bg-blue-50 cursor-pointer transition ${
                  selectedMonth === statement.month ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <div>
                  <div className="font-semibold text-lg">
                    {formatMonthYear(statement.month)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Amount: ₹
                    {statement.total_spent?.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transactions below */}
          {selectedMonth && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Transactions for {formatMonthYear(selectedMonth)}
              </h2>

              {loadingTx ? (
                <div className="text-gray-500">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-gray-500">No transactions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left border">Date</th>
                        <th className="px-4 py-2 text-left border">Reference No</th>
                        <th className="px-4 py-2 text-left border">Details</th>
                        <th className="px-4 py-2 text-right border">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border">{tx.date}</td>
                          <td className="px-4 py-2 border">{tx.reference_no}</td>
                          <td className="px-4 py-2 border">
                            {tx.transaction_details}
                          </td>
                          <td className="px-4 py-2 border text-right">
                            {tx.amount?.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
