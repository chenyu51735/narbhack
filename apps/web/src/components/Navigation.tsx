'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { openMessagesModal } from './common/MessagesModal';

export default function Navigation() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate authentication check - in a real app, this would check with your auth service
  useEffect(() => {
    // Check if user is authenticated (you can replace this with your actual auth logic)
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    // Listen for auth changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const checkUnread = () => {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`unread_${userEmail}_`)) {
          count++;
        }
      }
      setUnreadCount(count);
    };
    checkUnread();
    window.addEventListener('storage', checkUnread);
    window.addEventListener('unread-updated', checkUnread);
    return () => {
      window.removeEventListener('storage', checkUnread);
      window.removeEventListener('unread-updated', checkUnread);
    };
  }, []);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/game', label: 'Game' },
    { href: '/companion', label: 'Companion' },
    // Only show messages and profile if authenticated
    ...(isAuthenticated ? [
      { href: '/messages', label: 'Messages' },
      { href: '/profile', label: 'Profile' },
    ] : [
      { href: '/auth', label: 'Sign In' },
    ]),
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo.svg" alt="Voxxi logo" width={40} height={16} className="h-8 w-auto" />
              <span className="text-xl font-bold text-blue-400 hidden sm:inline">Voxxi</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                  {item.label === 'Messages' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 