"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface StorefrontNavProps {
  buyerId: number | null;
}

export function StorefrontNav({ buyerId }: StorefrontNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch unread count when user is logged in
  useEffect(() => {
    if (!buyerId) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/messages/unread-count");
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds for unread count
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [buyerId]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden items-center gap-6 sm:flex">
        <Link href="/browse" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
          Browse
        </Link>
        {buyerId ? (
          <>
            <Link href="/messages" className="relative text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/orders" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Orders
            </Link>
            <Link href="/account" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Account
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Logout
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
          Admin
        </Link>
      </nav>

      {/* Mobile Menu Button - Visible only on mobile */}
      <div className="relative sm:hidden" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          Menu
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                style={{ top: "4rem" }}
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Dropdown Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl ring-1 ring-slate-200/50 z-50 overflow-hidden"
              >
                <div className="py-2">
                  <Link
                    href="/browse"
                    className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse
                  </Link>
                  {buyerId ? (
                    <>
                      <Link
                        href="/messages"
                        className="relative flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>Messages</span>
                        {unreadCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        href="/account"
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Account
                      </Link>
                      <form action="/api/auth/logout" method="post">
                        <button
                          type="submit"
                          className="w-full text-left block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Logout
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                  <div className="my-2 border-t border-slate-200/60" />
                  <Link
                    href="/admin"
                    className="block px-4 py-3 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
