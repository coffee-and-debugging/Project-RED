import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiChevronDown,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";
import { FaHistory, FaTint, FaUser } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { BsChatDots } from "react-icons/bs";

const NavBar = ({ currentPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveMenu(tab);
    else setActiveMenu("Profile");
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      fetch("http://localhost:8000/api/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.results)) {
            setNotifications(data.results);
          } else {
            setNotifications([]);
          }
        })
        .catch((err) => console.error("Error Fetching Notifications:", err));
      setNotifications([]);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to LogOut?");
    if(!confirmed) return;

    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  const handleMenuClick = (label) => {
    setActiveMenu(label);
    navigate(`/account?tab=${label}`);
    setShowDropdown(false);
  };

  // Main menu Items
  const navItems = [
    { label: "Home", path: "/", icon: <FiHome /> },
    { label: "About Us", path: "/about" },
    { label: "Why Donate Blood", path: "/why-donate" },
    { label: "Blood Compatibility", path: "/blood-compatibility" },
  ];

  // My Account menu Items
  const menuItems = [
    {
      label: "Profile", icon: <FaUser />, color: "text-gray-500",
    },
    { label: "Donation History", icon: <FaHistory />, color: "text-green-300" },
    { label: "Blood Requests", icon: <FaTint />, color: "text-red-400" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div
        className={`flex-1 bg-gray-700 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-66" : "lg:ml-25"
        }`}
      >
        {/* Navbar */}
        <nav className="sticky top-0 flex z-50 items-center justify-between px-4 sm:px-6 md:px-8 py-3 pt-4 border-b-2 border-gray-600 bg-gray-800">
          <img src="/logo.png" alt="Logo" className="w-12 h-auto lg:hidden cursor-pointer" onClick={() => navigate("/")} />


          {/* Mobile Menu */}
          <div
            className="lg:hidden text-white text-2xl relative"
            ref={mobileMenuRef}
          >
            <div className="flex gap-4 items-center">
              {/* Chat Room Button */}
              <div className="relative group">
                <button
                  onClick={() => navigate("/chat-rooms")}
                  className={`text-2xl cursor-pointer transition-colors duration-200 ${location.pathname.startsWith("/chat-rooms") ? "text-red-400" : "text-white hover:text-red-400"}`}
                >
                  <BsChatDots />
                </button>
                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 mt-8 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  Chat Rooms
                </span>
              </div>

              {/* Notifications menu icon */}
              <div className="relative group">
                <button
                  onClick={() => navigate("/notifications")}
                  className={`relative text-2xl cursor-pointer transition-colors duration-200 ${location.pathname === "/notifications" ? "text-red-400" : "text-white hover:text-red-400"}`}
                >
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-600 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 mt-8 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  Notifications
                </span>
              </div>

              {/* Hamburger icon menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="cursor-pointer hover:text-blue-300 transition duration-300"
              >
                {mobileMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>


            {/* Mobile Menu List */}
            {mobileMenuOpen && (
              <div className="absolute right-0 mt-5 bg-gray-800 text-white rounded shadow-lg p-4 w-72">
                <ul className="space-y-5 text-lg font-medium">
                  {navItems.map((item, i) => (
                    <NavLink
                      key={i}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>`block hover:text-red-400 ${
                        isActive ? "text-red-400 font-bold" : ""
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  {isLoggedIn && (
                    <>
                    <NavLink
                      to="/blood-request"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive })=> `block hover:text-red-400 ${
                        isActive ? "text-red-400 font-bold" : ""
                      }`}
                    >
                      Blood Request
                    </NavLink>

                    {/* Patients Request */}
                    <NavLink
                      to="/patients-request"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive })=> `block hover:text-red-400 ${
                        isActive ? "text-red-400 font-bold" : ""
                      }`}
                    >
                      Patients Request
                    </NavLink>

                    {/* Chat Room */}
                    <NavLink
                      to="/chat-rooms"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block hover:text-red-400 ${
                        (location.pathname.startsWith("/chat-rooms")) ? "text-red-400 font-bold" : ""
                      }`}
                    >
                      Chat Rooms
                    </NavLink>
                    </>
                  )}

                  {!isLoggedIn && (
                    <NavLink
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive })=> `block hover:text-red-400 ${
                        isActive ? "text-red-400 font-bold" : ""
                      }`}
                    >
                      Register Now
                    </NavLink>
                  )}

                  {isLoggedIn ? (
                    <>
                      <NavLink
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive })=> `block hover:text-red-400 ${
                          isActive ? "text-red-400 font-bold" : ""
                        }`}
                      >
                        Profile
                      </NavLink>

                      <button
                        onClick={handleLogout}
                        className="block text-left bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded w-fit"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/login");
                      }}
                      className="block bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded w-full"
                    >
                      Log In
                    </button>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* For Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4 text-white ml-auto">

            {/* Chat Room Button */}
            {isLoggedIn && (
            <div className="relative group">
              <button
                onClick={() => navigate("/chat-rooms")}
                className={`text-2xl cursor-pointer transition-colors duration-200 ${location.pathname.startsWith("/chat-rooms") ? "text-red-400" : "text-white hover:text-red-400"}`}
              >
                <BsChatDots />
              </button>
              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 mt-8 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                Chat Rooms
              </span>
            </div>
            )}

            {/* Notification icon */}
            <div className="relative group">
              <button
                onClick={() => navigate("/notifications")}
                className={`relative text-2xl cursor-pointer transition-colors duration-200 ${location.pathname === "/notifications" ? "text-red-400" : "text-white hover:text-red-400"}`}
              >
                <FiBell />
                {/* Add a red dot */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-600 text-xs text-white ">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 mt-8 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                Notifications
              </span>
            </div>

            {/* Profile icon Menu*/}
            {isLoggedIn ? (
              <div className="relative group" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className={`flex items-center font-bold px-4 py-1.5 rounded text-2xl hover:text-red-400 cursor-pointer ${
                    location.pathname.startsWith("/account")
                      ? "text-red-400"
                      : "text-white hover:text-red-400"
                  }`}
                >
                  <FiUser />
                  <FiChevronDown />
                </button>

                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 mt-1 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  Profile
                </span>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-65 bg-gray-700 rounded-xl shadow-lg z-50 overflow-hidden text-lg pb-5">
                    <ul className="flex flex-col divide-y divide-gray-900">
                      {menuItems.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => handleMenuClick(item.label)}
                          className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition duration-200 ease-in-out ${
                            activeMenu === item.label
                              ? " bg-green-900 text-red-300"
                              : "hover:bg-gray-800"
                          }`}
                        >
                          <span className={`text-xl ${item.color}`}>
                            {item.icon}
                          </span>
                          <span className="text-md font-medium">
                            {item.label}
                          </span>
                        </li>
                      ))}

                      <li
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer transition hover:bg-gray-800 text-md font-medium"
                      >
                        <FiLogOut className="text-xl text-blue-400 font-bold" />{" "}
                        Log Out
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="font-medium bg-red-700 hover:bg-red-800 text-white px-5 py-1.5 rounded text-lg "
              >
                Log In
              </button>
            )}
          </div>
        </nav>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
