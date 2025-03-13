import React from "react";

export const Progress = ({ value = 0, className = "", ...props }) => {
  return (
    <div
      className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
      {...props}
    >
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default Progress;