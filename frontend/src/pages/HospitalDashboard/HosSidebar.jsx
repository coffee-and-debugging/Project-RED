import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaTint,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { AiOutlineFileText } from "react-icons/ai";
import { AiOutlineInbox } from "react-icons/ai";
import { RiMenu2Line } from "react-icons/ri";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";

const HosSidebar = ({isOpen, setIsOpen}) => {
  const navigate = useNavigate();
  
  const menus = [
    { name: "Dashboard", icon: <FaTachometerAlt className="text-blue-500"/>, path: "/hospital-dashboard" },
    // { name: "Blood Inventory", icon: <FaTint className="text-rose-600" />, path: "/blood-inventory" },
    // { name: "Donors", icon: <FaUser className="text-green-500"/>, path: "/donor-dashboard" },
    // { name: "Reports", icon: <AiOutlineFileText className="text-blue-500 text-2xl" />, path: "/users-reports"},
    // { name: "Requests", icon: <AiOutlineInbox className="text-red-400 text-2xl"/>, path: "/patient-dashboard" },
    // { name: "Settings", icon: <FaCog className="text-gray-500"/>, path: "/settings" },
  ];

  // Logout handler
  const handleLogout = () =>{
    localStorage.removeItem("hospitalToken");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // clear session storage too
    sessionStorage.clear();
    navigate("/hospital-login");
  }

  return (
    <div
      className={`flex top-0 left-0 h-screen ${
        isOpen ? "w-66" : "w-25"
      } bg-white fixed transition-all duration-300 z-50 flex-col overflow-visible`}
    >

      {/* Top Section */}
      <div className="relative">
        <div className="flex items-center justify-center gap-3 p-4 border-b border-gray-300 shadow-2xl">
          <img
            src="/logo.png"
            alt="LOGO"
            className={`transition-all duration-300 cursor-pointer ${
              isOpen ? "w-10" : "w-13 mx-auto"
            }`}
            onClick={() => navigate("/hospital-dashboard")}
          />
          {isOpen && (
            <span className="text-red-600 font-bold text-xl whitespace-nowrap">
              Project R.E.D
            </span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-end px-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-3xl cursor-pointer p-2 hover:text-blue-500 font-extrabold"
        >
          {isOpen ? <FiMenu /> : <RiMenu2Line />}
        </button>
      </div>

      {/* Menu Section */}
      <nav className="flex flex-col items-start py-4 pl-2 space-y-2 relative">
        {menus.map((menu, i) => (
          <NavLink
            key={i}
            to={menu.path}
            className={({ isActive }) =>
              `group relative flex items-center p-3 rounded-l-md text-gray-700 w-full transition-all duration-200 ${
                isActive
                  ? "bg-[#e4f0f0] text-red-500 border-l-4 border-red-500 "
                  : "hover:bg-[#e4f0f0]"
              } font-medium text-lg ${isOpen ? "gap-4" : "justify-center"}`
            }
          >
            <span
              className={`${
                isOpen ? "text-xl" : "text-2xl"
              } flex items-center justify-center`}
            >
              {menu.icon}
            </span>

            {/* Show text if open */}
            {isOpen && (
              <span
                className={`transition-all duration-300 transform group-hover:translate-x-3`}
              >
                {menu.name}
              </span>
            )}

            {/* Tooltip when closed */}
            {!isOpen && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-gray-800 text-white text-sm opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                {menu.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer (Logout) */}
      <div className="mt-auto pb-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`group flex items-center w-full px-4 py-3 rounded-lg text-gray-700 font-medium transition-all duration-200 hover:bg-red-100 hover:text-red-600 ${isOpen ? "justify-start gap-3" : "justify-center"}`}
        >
          <FaSignOutAlt className="text-xl group-hover:scale-110 transition-transform duration-200" />
          {isOpen && (
            <span className="group-hover:translate-x-1 transition-transform">
              Logout
            </span>
          )}

          {/* Tooltip when closed */}
          {!isOpen && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-gray-800 text-white text-sm opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default HosSidebar;
