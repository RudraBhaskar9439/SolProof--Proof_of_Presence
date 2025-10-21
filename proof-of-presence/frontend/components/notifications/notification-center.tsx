"use client"

import { useState } from "react"

interface Notification {
  id: string
  type: "success" | "info" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓"
      case "info":
        return "ℹ"
      case "warning":
        return "!"
      case "error":
        return "✕"
      default:
        return "•"
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-primary"
      case "info":
        return "text-accent"
      case "warning":
        return "text-warning"
      case "error":
        return "text-destructive"
      default:
        return "text-foreground-muted"
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-surface-light rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-lg shadow-lg border border-surface-light z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-surface-light">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs text-foreground-muted hover:text-foreground">
                Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 border-b border-surface-light cursor-pointer hover:bg-surface-light transition-colors ${
                    !notification.read ? "bg-surface-light" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`text-lg font-bold ${getColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-foreground-muted text-sm">{notification.message}</p>
                      <p className="text-xs text-foreground-muted mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
