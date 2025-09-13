
import React from "react";

const months = [
  "January 2025",
  "February 2025",
  "March 2025",
  "April 2025",
  "May 2025",
  "June 2025",
  "July 2025",
  "August 2025",
  "September 2025",
  "October 2025",
  "November 2025",
  "December 2025",
];

export default function StatementsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monthly Statements</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((month) => (
          <div
            key={month}
            className="p-4 rounded-lg shadow-md bg-white hover:bg-blue-50 cursor-pointer transition"
            onClick={() =>
              window.triggerChatbot &&
              window.triggerChatbot("statement-month", { month })
            }
          >
            <div className="font-semibold text-lg">{month}</div>
            <div className="text-sm text-gray-600">Click to analyze this month</div>
          </div>
        ))}
      </div>
    </div>
  );
}
