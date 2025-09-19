import React, { useState } from "react";
import {
  FaBell,
  FaSearch,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";

const HospiNavBar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-16 ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      } border-b shadow-sm flex items-center justify-between px-6 ml-64 z-10 transition-all`}
    >
      {/* Left - Page Title */}
      <h2
        className={`text-xl font-semibold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Hospital Dashboard
      </h2>

      {/* Middle - Search */}
      <div
        className={`hidden md:flex items-center ${
          darkMode ? "bg-gray-800" : "bg-gray-100"
        } rounded-lg px-3 py-1 w-80`}
      >
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className={`bg-transparent focus:outline-none w-full text-sm ${
            darkMode ? "text-gray-300 placeholder-gray-400" : "text-gray-700"
          }`}
        />
      </div>

      {/* Right - Notifications + Dark Mode + Profile */}
      <div className="flex items-center gap-6 relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-gray-600 hover:text-red-600"
        >
          {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative text-gray-600 hover:text-red-600"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell size={18} />
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-64 ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              } shadow-lg rounded-lg p-3`}
            >
              <h4 className="font-semibold mb-2 text-sm">Notifications</h4>
              <ul className="text-sm space-y-2">
                <li className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                  New blood request received
                </li>
                <li className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                  Stock updated successfully
                </li>
                <li className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                  Donor John Doe confirmed donation
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <FaUserCircle size={28} className="text-gray-600" />
            <span
              className={`hidden md:block font-medium ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Admin
            </span>
          </div>

          {showProfileMenu && (
            <div
              className={`absolute right-0 mt-2 w-48 ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              } shadow-lg rounded-lg p-2`}
            >
              <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <FaCog /> Settings
              </button>
              <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospiNavBar;
