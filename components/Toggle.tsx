'use client';

interface ToggleProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function Toggle({ label, options, value, onChange }: ToggleProps) {
  return (
    <div className="mb-4">
      <label className="block text-gray-300 text-sm font-medium mb-1 align-bottom">
        {label}
      </label>
      <div className="flex bg-gray-700 rounded-lg p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
              value === opt.value
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
