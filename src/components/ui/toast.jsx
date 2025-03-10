import React from "react";

const toast = ({ message, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-md">
      {message}
      <button className="ml-2 text-red-400" onClick={onClose}>X</button>
    </div>
  );
};

export { toast };
