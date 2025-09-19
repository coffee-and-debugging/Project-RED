import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaExclamationTriangle,
  FaHeart,
  FaHospital,
  FaInfoCircle,
  FaTint,
} from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/api/notifications/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();
        setNotifications(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Single notification read mark as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:8000/api/notifications/${id}/mark_read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to mark notification as read.");
      await res.json();
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to mark notification as read.");
    }
  };

  // All notification read Mark all as Read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:8000/api/notifications/mark_all_read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to mark all notifications as read.");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
      alert("Failed to mark all notifications as read.");
    }
  };

  const typeStyles = {
    life_saved: {
      icon: <FaHeart className="text-red-500 text-2xl" />,
      bg: "bg-red-100",
      tag: "bg-red-600",
    },
    health_alert: {
      icon: <FaExclamationTriangle className="text-orange-500 text-2xl" />,
      bg: "bg-orange-100",
      tag: "bg-orange-600",
    },
    hospital_assigned: {
      icon: <FaHospital className="text-blue-500 text-2xl" />,
      bg: "bg-blue-100",
      tag: "bg-blue-600",
    },
    blood_request: {
      icon: <FaTint className="text-red-700 text-2xl" />,
      bg: "bg-pink-100",
      tag: "bg-pink-600",
    },
    donation_completed: {
      icon: <FaInfoCircle className="text-sky-500 text-2xl" />,
      bg: "bg-sky-100",
      tag: "bg-sky-600",
    },
  };

  if (loading)
    return <p className="text-sm text-gray-500">Loading notifications...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div className="bg-gray-900 rounded-2xl shadow-lg p-5 sm:p-7 max-w-3xl mx-auto w-full border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-lg sm:text-2xl font-bold text-white">
          <FaBell className="text-yellow-400" /> Notifications
          {notifications.some((n) => !n.is_read) && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.is_read).length}
            </span>
          )}
        </h2>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="text-xs sm:text-sm px-3 py-1 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-400">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifications
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((note) => {
              const styles =
                typeStyles[note.notification_type] ||
                typeStyles["blood_request"];
              return (
                <li
                  key={note.id}
                  onClick={() => {
                    setSelected(note);
                    if (!note.is_read) markAsRead(note.id);
                  }}
                  className={`p-3 rounded-lg border border-gray-700 shadow-sm transition cursor-pointer ${
                    note.is_read
                      ? "bg-gray-700/50 text-gray-300"
                      : "bg-gray-700 text-white"
                  }
                  hover:scale-[1.01] hover:shadow-md`}
                >
                  {/* Content */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-bold flex items-center gap-2">
                      {styles.icon} {note.title}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{note.message}</p>
                  <span
                    className={`mt-2 inline-block px-2 py-1 text-xs rounded-full text-white ${styles.tag}`}
                  >
                    {note.notification_type.replace("_", " ")}
                  </span>
                  {!note.is_read && (
                    <span className="ml-2 inline-block text-xs font-medium text-yellow-400">
                      ● New
                    </span>
                  )}
                </li>
              );
            })}
        </ul>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 cursor-pointer text-lg"
            >
              <FiX className="text-2xl" />
            </button>

            {/* Model Content */}
            <div className="flex items-center gap-2 mb-4">
              {typeStyles[selected.notification_type]?.icon}
              <h3 className="text-xl font-bold">{selected.title}</h3>
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-white text-sm mb-3 ${
                typeStyles[selected.notification_type]?.tag
              }`}
            >
              {selected.notification_type.replace("_", " ")}
            </span>

            <p className="bg-gray-100 mb-3 p-3 rounded">{selected.message}</p>
            <p className="text-xs text-gray-500">
              Received: {new Date(selected.created_at).toLocaleString()}
            </p>

            {/* Actions Accept or Reject */}
            {selected.notification_type === "blood_request" ? (
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    navigate("/patients-request");
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            ) : (
              <>
                {/* Close Button */}
                <div className="mt-5 text-right">
                  <button
                    onClick={() => setSelected(null)}
                    className="mt-4 px-4 py-2 rounded-lg bg-yellow-300 text-black font-medium hover:bg-yellow-200 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
