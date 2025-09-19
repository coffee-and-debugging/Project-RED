import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaTint,
  FaUser,
  FaClipboardList,
  FaHospitalSymbol,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaHospital,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import HospiNavBar from "./HospiNavBar";

const HosSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

   const menus = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/" },
    { name: "Blood Inventory", icon: <FaTint />, path: "/blood-inventory" },
    { name: "Donors", icon: <FaUser />, path: "/donors" },
    { name: "Requests", icon: <FaClipboardList />, path: "/requests" },
    { name: "Hospitals", icon: <FaHospital />, path: "/hospitals" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } h-screen bg-[#e4f0f0] border-r border-gray-200 shadow-sm fixed transition-all duration-300 flex flex-col`}
    >
      <HospiNavBar />
      {/* Top Section */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
        <h1
          className={`text-xl font-bold text-red-600 tracking-wide ${
            !isOpen && "hidden"
          } md:block`}
        >
          Project RED
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <FaBars className="text-gray-600" />
        </button>
      </div>

      {/* Menu Section */}
      <nav className="flex flex-col mt-6 flex-1">
        {menus.map((menu, i) => (
          <NavLink
            key={i}
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-gray-700 font-medium transition-all duration-200 ${
                isActive
                  ? "bg-red-50 text-red-600 border-l-4 border-red-500 shadow-sm"
                  : "hover:bg-gray-100"
              }`
            }
          >
            <span className="text-lg">{menu.icon}</span>
            <span className={`${!isOpen && "hidden"} md:block`}>
              {menu.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer (Logout) */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all">
          <FaSignOutAlt />
          <span className={`${!isOpen && "hidden"} md:block`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default HosSidebar;
