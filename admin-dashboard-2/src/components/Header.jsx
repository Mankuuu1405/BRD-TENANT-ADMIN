import { useEffect, useState, useRef } from "react";
import {
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

export default function Header({ onRefresh, onExportReport }) {
  const [avatar, setAvatar] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Mock user data
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Tenant Administrator",
  });

  useEffect(() => {
    const load = () => {
      try {
        setAvatar(localStorage.getItem("profile_avatar") || null);
        // Load user data
        const userData = localStorage.getItem("user_data");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch {}
    };

    load();

    // Load notifications
    loadNotifications();

    const h = () => load();
    window.addEventListener("profile-avatar-updated", h);
    window.addEventListener("storage", h);

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("profile-avatar-updated", h);
      window.removeEventListener("storage", h);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mock function to load notifications
  const loadNotifications = () => {
    // In a real app, this would be an API call
    const mockNotifications = [
      {
        id: 1,
        title: "New loan application",
        message: "John Doe submitted a new loan application",
        time: "5 minutes ago",
        read: false,
      },
      {
        id: 2,
        title: "Document pending",
        message: "Upload pending documents for loan #12345",
        time: "1 hour ago",
        read: false,
      },
      {
        id: 3,
        title: "System update",
        message: "System will be updated on Sunday at 2 AM",
        time: "1 day ago",
        read: true,
      },
    ];

    setNotifications(mockNotifications);
    setNotificationCount(mockNotifications.filter((n) => !n.read).length);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      // Reload notifications after refresh
      loadNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  // Handle export report
  const handleExportReport = async () => {
    setExporting(true);
    try {
      if (onExportReport) {
        await onExportReport();
      }
    } finally {
      setExporting(false);
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setNotificationCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setNotificationCount(0);
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, this would call a logout API
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  };

  // Navigate to settings with specific tab
  const navigateToSettings = (tab) => {
    // Store the active tab preference
    localStorage.setItem("settings_active_tab", tab);

    // Navigate to settings page
    window.dispatchEvent(new CustomEvent("navigate", { detail: "settings" }));
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">
      <div className="flex flex-col">
        <div className="font-semibold">Tenant Admin Dashboard</div>
        <div className="text-sm text-gray-600">
          Multi-Tenant LOS Platform Overview
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Export Report Button */}
        <button
          onClick={handleExportReport}
          disabled={exporting}
          className="h-9 px-4 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center gap-2 hover:bg-gray-50 disabled:opacity-60"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          {exporting ? "Exporting..." : "Export Report"}
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-9 px-4 rounded-full bg-primary-600 text-white flex items-center gap-2 hover:bg-primary-700 disabled:opacity-60"
        >
          {refreshing ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Refreshing...
            </>
          ) : (
            "Refresh"
          )}
        </button>

        {/* Notifications Button */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="h-9 w-9 rounded-full grid place-items-center border border-gray-200 bg-white hover:bg-gray-50 relative"
          >
            <BellIcon className="h-5 w-5 text-gray-500" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium">Notifications</h3>
                {notificationCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-gray-200">
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("navigate", { detail: "notifications" })
                    )
                  }
                  className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-2"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Button */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="h-9 w-9 rounded-full bg-primary-600 text-white grid place-items-center overflow-hidden hover:bg-primary-700"
          >
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-600 text-white grid place-items-center overflow-hidden mr-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    // Navigate to settings with profile tab
                    navigateToSettings("profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3"
                >
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setShowProfile(false);
                    // Navigate to settings with system settings tab
                    navigateToSettings("settings");
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3"
                >
                  <Cog6ToothIcon className="h-4 w-4 text-gray-500" />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
