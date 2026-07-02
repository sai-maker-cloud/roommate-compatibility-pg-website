import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getNotifications, getUnreadCount, markAsRead, markAllRead } from "../../api/notifications.js";
import { getSocket } from "../../api/socket.js";
import { useAuth } from "../../auth/AuthProvider.jsx";

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();

      const socket = getSocket();
      socket.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        socket.off("newNotification");
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification._id, { stopPropagation: () => {} });
    }
    setIsOpen(false);

    switch (notification.type) {
      case "booking_accepted":
      case "booking_rejected":
        navigate("/bookings");
        break;
      case "new_booking":
        navigate("/owner/bookings");
        break;
      case "new_message":
        navigate("/messages");
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-slate-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[32rem]">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${
                      !notif.read ? "bg-teal-900/10" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-medium ${!notif.read ? "text-teal-400" : "text-slate-300"}`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs text-slate-500 shrink-0 ml-2">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        className="p-1.5 text-slate-500 hover:text-white rounded-full hover:bg-slate-700 transition-colors shrink-0 h-fit"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
