'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Heart, CalendarPlus, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store';
import { selectSavedActivities } from '@/store/savedActivitiesSlice';

const navLinks = [
  { href: '/', label: 'Explore', icon: MapPin },
  { href: '/saved', label: 'Saved', icon: Heart },
  { href: '/plans', label: 'Plans', icon: CalendarDays },
  { href: '/plans/new', label: 'New Plan', icon: CalendarPlus },
];

export function Navbar() {
  const pathname = usePathname();
  const savedActivities = useAppSelector(selectSavedActivities);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-900 font-bold text-sm"
            style={{ backgroundColor: '#97E565' }}
          >
            TP
          </span>
          <span className="font-bold text-lg text-gray-900 hidden sm:inline">Trip Picks</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand/10 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                {href === '/saved' && savedActivities.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-gray-900 text-[10px] font-bold">
                    {savedActivities.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
