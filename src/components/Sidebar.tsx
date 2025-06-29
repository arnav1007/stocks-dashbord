'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'Portfolio', href: '/portfolio', icon: '💼' },
  { label: 'Watchlist', href: '/watchlist', icon: '👀' },
  { label: 'Markets', href: '/markets', icon: '📈' },
  { label: 'News', href: '/news', icon: '📰' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (href: string) => {
    setIsMobileOpen(false);
    if (pathname !== href) {
      router.push(href);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-gray-100 text-gray-500 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 hover:text-gray-700 transition-colors"
        aria-label="Toggle mobile menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } min-h-screen flex flex-col fixed lg:relative z-30 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-lg sm:text-xl font-bold text-blue-400">
                StockTracker
              </h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors hidden lg:block"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? '→' : '←'}
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
              aria-label="Close mobile menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4">
          <ul className="space-y-1 sm:space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => handleNav(item.href)}
                    className={`w-full text-left flex items-center p-2 sm:p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="text-lg sm:text-xl mr-2 sm:mr-3">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium text-sm sm:text-base">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          {!isCollapsed && (
            <div className="text-xs sm:text-sm text-gray-400">
              <p>Market Status</p>
              <p className="text-green-400 font-medium">Open</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 