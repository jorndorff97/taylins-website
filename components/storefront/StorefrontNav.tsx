"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { HeaderSearch } from "./HeaderSearch";
import { CartIcon } from "./CartIcon";

export function StorefrontNav() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchCounts = async () => {
      try {
        const [msgRes, notifRes] = await Promise.all([
          fetch("/api/messages/unread-count"),
          fetch("/api/notifications?limit=1"),
        ]);
        const msgData = await msgRes.json();
        const notifData = await notifRes.json();
        setUnreadCount(msgData.unreadCount || 0);
        setNotifCount(notifData.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }
    if (isMenuOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const totalBadge = unreadCount + notifCount;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <HeaderSearch />
      <CartIcon />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {/* Animated hamburger / X */}
          <div className="flex w-[18px] flex-col items-center gap-[5px]">
            <motion.span
              animate={
                isMenuOpen
                  ? { rotate: 45, y: 7, width: 18 }
                  : { rotate: 0, y: 0, width: 18 }
              }
              transition={{ duration: 0.2 }}
              className="block h-[1.5px] rounded-full bg-current"
              style={{ originX: "center" }}
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              className="block h-[1.5px] w-[18px] rounded-full bg-current"
            />
            <motion.span
              animate={
                isMenuOpen
                  ? { rotate: -45, y: -7, width: 18 }
                  : { rotate: 0, y: 0, width: 18 }
              }
              transition={{ duration: 0.2 }}
              className="block h-[1.5px] rounded-full bg-current"
              style={{ originX: "center" }}
            />
          </div>

          {/* Unread badge */}
          {totalBadge > 0 && !isMenuOpen && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
                style={{ top: "4rem" }}
                onClick={() => setIsMenuOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-slate-200/50 backdrop-blur-xl"
              >
                <nav className="py-2">
                  <Link
                    href="/"
                    className="block px-5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/browse"
                    className="block px-5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse
                  </Link>

                  <div className="mx-5 my-1 border-t border-slate-100" />

                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/messages"
                        className="flex items-center justify-between px-5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>Messages</span>
                        {unreadCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/notifications"
                        className="flex items-center justify-between px-5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>Notifications</span>
                        {notifCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {notifCount > 9 ? "9+" : notifCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Orders
                      </Link>

                      <div className="mx-5 my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="block w-full px-5 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-5 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}

                  <div className="mx-5 my-1 border-t border-slate-200/60" />

                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-5 py-3 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </Link>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
