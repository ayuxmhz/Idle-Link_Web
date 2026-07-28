"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, UserCircle, CheckCheck, Menu } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";
import { useSidebar } from "@/components/SidebarContext";
import { resolveImageUrl } from "@/lib/api/axios-instance";
import {
  listMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/lib/api/notifications";

interface HeaderProps {
  title?: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Header({ title = "Home" }: HeaderProps) {
  const { user } = useUser();
  const { toggle } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {
      // silent — the bell just won't show a badge if this fails
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUnreadCount();
    })();
  }, [refreshUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setLoading(true);
      try {
        const res = await listMyNotifications({ limit: 10 });
        setNotifications(res.data);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.read) return;
    setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationAsRead(notification._id);
    } catch {
      // best-effort — local state already updated for responsiveness
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsAsRead();
    } catch {
      // best-effort
    }
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-5 border-b border-[#262736] bg-[#11121a]">
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="lg:hidden text-gray-400 hover:text-white transition-colors">
          <Menu size={22} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleToggle}
            className="text-gray-400 hover:text-white transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 flex items-center justify-center bg-[#F97316] text-white text-[10px] font-bold rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-[#16171f] border border-[#2a2b36] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2b36]">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-[#cbbefa] hover:text-white transition-colors"
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-[#2a2b36] last:border-b-0 hover:bg-[#1a1b25] transition-colors flex items-start gap-2 ${
                        !n.read ? "bg-[#1a1b25]/50" : ""
                      }`}
                    >
                      {!n.read && <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#cbbefa] shrink-0" />}
                      <div className={n.read ? "pl-3.5" : ""}>
                        <p className="text-xs text-gray-200 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/profile" className="text-gray-400 hover:text-white transition-colors overflow-hidden rounded-full w-8 h-8 flex items-center justify-center">
          {user?.profilePicture ? (
            <Image
              src={resolveImageUrl(user.profilePicture)!}
              alt="Profile"
              width={32}
              height={32}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <UserCircle size={28} />
          )}
        </Link>
      </div>
    </header>
  );
}
