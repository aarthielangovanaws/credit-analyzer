import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`text-xl font-bold mb-2 text-center ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
