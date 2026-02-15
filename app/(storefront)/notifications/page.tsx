import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";

export default async function NotificationsPage() {
  const buyerId = await getBuyerId();

  if (!buyerId) {
    redirect("/login?redirect=/notifications");
  }

  const notifications = await prisma.notification.findMany({
    where: {
      buyerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllAsRead() {
    "use server";
    const buyerId = await getBuyerId();
    if (!buyerId) return;

    await prisma.notification.updateMany({
      where: {
        buyerId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  function formatTimeAgo(date: Date) {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllAsRead}>
            <button
              type="submit"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">No notifications yet</h2>
          <p className="text-slate-600 text-center mb-8 max-w-md leading-relaxed">
            You'll receive notifications when there are updates about your orders and messages.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-slate-800 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link || "/notifications"}
              className={`block rounded-lg border p-4 transition-all hover:shadow-md ${
                !notification.read
                  ? "border-blue-200 bg-blue-50/50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
