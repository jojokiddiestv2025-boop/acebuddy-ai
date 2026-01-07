
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-gray-700 text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Input;
