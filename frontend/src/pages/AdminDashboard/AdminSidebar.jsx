import React, { useState } from "react";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/admin-dashboard" },
    { label: "Donor Lists", path: "/donor-lists" },
    { label: "Hospital Lists", path: "/hospital-lists" },
    { label: "Add Hospitals", path: "/add-hospitals" },
    { label: "Home Page", path: "/" },
  ];

  const handleNav = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <div className="lg:hidden sticky top-0 bg-blue-300 text-white left-4 z-5 flex justify-between items-center px-4 py-3 shadow-md">
        <img src="/logo.png" alt="Logo" className="w-10 h-auto" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-black focus:outline-none"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#5D5C5C] text-white lg:h-screen lg:sticky z-40 transform transition-transform duration-300 ease-in-out rounded-t-4xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="mb-4 w-full flex justify-center bg-gray-700 py-4 rounded-t-2xl">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-15 h-auto mx-auto lg:mx-0"
            />
          </div>
       
          <div className="flex justify-center items-center gap-3 mb-8 px-4">
            <img
              src="/IMG_7927.JPG"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />

            <span className="font-semibold text-lg">Super Admin</span>
          </div>

     
          <nav className="flex-1 px-3">
            <ul className="space-y-6">
              {navItems.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleNav(item.path)}
                  className={`cursor-pointer px-6 py-3 rounded-full font-bold text-center transition ${
                    location.pathname === item.path
                      ? "bg-red-500"
                      : "bg-gray-700 hover:bg-red-500"
                  }`}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </nav>


          <div className="mt-auto border-t border-gray-500 py-4 flex justify-center">
            <button className="flex items-center gap-2 font-bold">
              <FiLogOut className="text-white text-lg" />
              Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
