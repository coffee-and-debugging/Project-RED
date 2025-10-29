import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import HosSidebar from "./HosSidebar";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const HospiNavBar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [hospitalName, setHospitalName] = useState("");

  useEffect(() => {
    const fetchHospital = async () => {
      // get hospital ID from localStorage (saved after login)
      const token = localStorage.getItem("hospitalToken");
      
      if (!token) return;
      
      try {
        const response = await axios.get(
          `http://localhost:8000/api/hospitals/2/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHospitalName(response.data.name);
      } catch (error) {
         console.error("Error fetching hospital:", error.response?.data || error.message);
      }
    };

    fetchHospital();
  }, []);

  return (
    <div className="flex min-h-screen">
      <HosSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {/* Left - Page Title */}
      <div
        className={`flex-1 bg-[#e4f0f0] transition-all duration-300 ${
          isOpen ? "lg:ml-66" : "lg:ml-25"
        }`}
      >
        {/* Navbar */}
        <nav className="sticky top-0 flex z-50 items-center justify-between px-8 py-3 pt-4 border-b-2 border-gray-300 bg-white">

          <h2 className="text-xl font-semibold
          ">{hospitalName} Dashboard</h2>

          {/* Notifications & Admin Profile*/}
          <div className="flex items-center gap-6 relative">
            <div className="relative">
              <button
                className="relative text-gray-600 hover:text-red-400 text-2xl cursor-pointer transition-all duration-200"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  3
                </span>
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white text-gray-800 shadow-lg rounded-lg p-3"
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
                  className={`hidden md:block font-medium text-gray-700`}
                >
                  Admin
                </span>
              </div>

              {showProfileMenu && (
                <div
                  className={`absolute right-0 mt-2 w-48 shadow-lg rounded-lg p-2`}
                >
                  <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                    <FaCog /> Settings
                  </button>
                  <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HospiNavBar;
