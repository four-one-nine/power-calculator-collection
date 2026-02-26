'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BoltIcon, ArrowPathIcon, CpuChipIcon, BoltSlashIcon } from '@heroicons/react/24/outline';

const navItems = [
  { href: '/amps-to-va', label: 'Amps → VA', icon: BoltIcon },
  { href: '/va-to-amps', label: 'VA → Amps', icon: ArrowPathIcon },
  { href: '/hp-to-amps', label: 'HP → Amps', icon: CpuChipIcon },
  { href: '/voltage-drop', label: 'Voltage Drop', icon: BoltSlashIcon },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
