"use client";

import { Bell, CheckCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Notification = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationResponse = {
  notifications: Notification[];
  unreadCount: number;
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [items, setItems] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [error, setError] = React.useState("");

  async function loadNotifications() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/me/notifications", { cache: "no-store" });
      if (response.status === 401) {
        setItems([]);
        setUnreadCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error("Notification load failed.");
      }

      const data = (await response.json()) as NotificationResponse;
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      setError("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    void loadNotifications();
  }, []);

  async function markAllRead() {
    await fetch("/api/me/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" })
    });
    await loadNotifications();
  }

  async function markOneRead(id: string) {
    await fetch(`/api/me/notifications/${id}`, { method: "PATCH" });
    setItems((current) => current.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item)));
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  return (
    <div className="relative hidden md:block">
      <button
        aria-label="Notifications"
        className="relative rounded-full p-2 text-primary hover:bg-muted"
        onClick={() => setIsOpen((value) => !value)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 size-2.5 rounded-full bg-[#176d44] ring-2 ring-[#fffaf5]" />
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="font-bold text-primary">Notifications</p>
              {unreadCount > 0 ? <Badge variant="success">{unreadCount} unread</Badge> : null}
            </div>
            <Button disabled={!unreadCount} onClick={() => void markAllRead()} size="sm" variant="ghost">
              <CheckCheck className="size-4" />
              Read
            </Button>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : null}
            {error ? <p className="px-3 py-6 text-sm font-semibold text-red-700">{error}</p> : null}
            {!isLoading && !error && items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
            ) : null}
            {items.map((item) => {
              const content = (
                <span className="block rounded-xl px-3 py-3 text-left hover:bg-muted">
                  <span className="flex items-start gap-2">
                    {!item.readAt ? <span className="mt-2 size-2 rounded-full bg-primary" /> : null}
                    <span>
                      <span className="block font-bold text-primary">{item.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-muted-foreground">{item.body}</span>
                    </span>
                  </span>
                </span>
              );

              return item.href ? (
                <Link key={item.id} href={item.href} onClick={() => void markOneRead(item.id)}>
                  {content}
                </Link>
              ) : (
                <button key={item.id} className="w-full" onClick={() => void markOneRead(item.id)} type="button">
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
