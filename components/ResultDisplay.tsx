'use client';

import { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface ResultDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export function ResultDisplay({ label, value, unit, className = '' }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = typeof value === 'number' ? value.toString() : value;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-gray-700 rounded-lg p-3 mt-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">{label}</span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-600 rounded transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <ClipboardIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
      <div className="text-2xl font-bold text-white mt-1">
        {value}
        {unit && <span className="text-lg text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}
