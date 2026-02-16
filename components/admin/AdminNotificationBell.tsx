"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications?isAdmin=true&limit=5");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }

  async function markAsRead(notificationId: number) {
    try {
      await fetch("/api/notifications?isAdmin=true", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/50 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Admin Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        await fetch("/api/notifications?isAdmin=true", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ markAll: true }),
                        });
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        setUnreadCount(0);
                      } catch (err) {
                        console.error("Failed to mark all as read:", err);
                      }
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-sm text-slate-500">No notifications yet</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link || "/admin"}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          setIsOpen(false);
                        }}
                        className={`block p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          !notification.read ? "bg-red-50/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-600 mt-1.5" />
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <Link
                  href="/admin/notifications"
                  className="block text-center text-xs font-medium text-slate-600 hover:text-slate-900"
                  onClick={() => setIsOpen(false)}
                >
                  View all activity
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
