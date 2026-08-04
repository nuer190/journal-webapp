import React from "react";

export const EmptyState: React.FC<{ message?: string }> = ({ message = "No data found" }) => (
  <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);