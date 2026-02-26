'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
}

export function Card({ children, title }: CardProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      {title && (
        <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      )}
      {children}
    </div>
  );
}
