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
import { TbReportMedical } from "react-icons/tb";


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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 togray-900">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-66" : "lg:ml-25"
        }`}
      >
        {/* Navbar */}
        <nav className="sticky top-0 flex z-50 items-center justify-between px-4 sm:px-6 md:px-8 py-3 border-b border-gray-700 bg-gray-900/80 backdrop-blur-lg shadow-md">
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
                  className={`p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition duration-200 ${location.pathname.startsWith("/chat-rooms") ? "text-red-400" : "text-white hover:text-red-400"}`}
                >
                  <BsChatDots />
                </button>
                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 mt-10 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  Chat Rooms
                </span>
              </div>

              {/* Notifications menu icon */}
              <div className="relative group">
                <button
                  onClick={() => navigate("/notifications")}
                  className={`relative p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition duration-200 ${location.pathname === "/notifications" ? "text-red-400" : "text-white hover:text-red-400"}`}
                >
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-600 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 mt-10 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  Notifications
                </span>
              </div>

              {/* Hamburger icon menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer hover:text-blue-300 transition duration-300"
              >
                {mobileMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>


            {/* Mobile Menu List */}
            {mobileMenuOpen && (
              <div className="absolute right-0 mt-5 bg-gray-800/95 backdrop-blur-lg  text-white rounded-2xl shadow-lg p-4 w-72 border border-gray-700">
                <ul className="space-y-4 text-lg font-medium">
                  {navItems.map((item, i) => (
                    <NavLink
                      key={i}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>`block px-3 py-2 rounded-lg transition ${
                        isActive ? "bg-red-700 font-bold hover:text-red-200" : "hover:bg-gray-700 hover:text-red-400"
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
                      className={({ isActive })=> `block px-3 py-2 rounded-lg ${
                        isActive ? "bg-red-700 hover:text-red-200 font-bold" : "hover:bg-gray-700 hover:text-red-400"
                      }`}
                    >
                      Blood Request
                    </NavLink>

                    {/* Patients Request */}
                    <NavLink
                      to="/patients-request"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive })=> `block px-3 py-2 rounded-lg ${
                        isActive ? "bg-red-700 hover:text-red-200 font-bold" : "hover:bg-gray-700 hover:text-red-400"
                      }`}
                    >
                      Patients Request
                    </NavLink>

                    {/* Chat Room */}
                    <NavLink
                      to="/chat-rooms"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg ${
                        (location.pathname.startsWith("/chat-rooms")) ? "bg-red-700 hover:text-red-200 font-bold" : "hover:bg-gray-700 hover:text-red-400"
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
                      className={({ isActive })=> `block px-3 py-2 rounded-lg ${
                        isActive ? "bg-red-700 hover:text-red-200 font-bold" : "hover:bg-gray-700 hover:text-red-400"
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
                        className={({ isActive })=> `block px-3 py-2 rounded-lg ${
                          isActive ? "bg-red-700 hover:text-red-200 font-bold" : "hover:bg-gray-700 hover:text-red-400"
                        }`}
                      >
                        Profile
                      </NavLink>

                      <button
                        onClick={handleLogout}
                        className="bg-red-700 hover:bg-red-900 text-white px-3 py-2 mt-3 rounded-lg w-full cursor-pointer"
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
                      className="w-full bg-sky-700 hover:bg-sky-900 text-white px-3 py-2 mt-3 rounded-lg cursor-pointer"
                    >
                      Log In
                    </button>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* For Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 text-white ml-auto">

            {/* Chat Room Button */}
            {isLoggedIn && (
              <>
              <div className="relative group">
              <button
                onClick={() => navigate("/reports")}
                className={`text-2xl cursor-pointer transition duration-200 ${location.pathname.startsWith("/reports") ? "text-red-400" : "text-white hover:text-red-400"}`}
              >
              <TbReportMedical />
              </button>
              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 mt-8 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                Reports
              </span>
            </div>

            <div className="relative group">
              <button
                onClick={() => navigate("/chat-rooms")}
                className={`text-2xl cursor-pointer transition duration-200 ${location.pathname.startsWith("/chat-rooms") ? "text-red-400" : "text-white hover:text-red-400"}`}
              >
                <BsChatDots />
              </button>
              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 mt-8 w-max text-sm text-white bg-gray-500 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                Chat Rooms
              </span>
            </div>
            </>
            )}

            {/* Notification icon */}
            <div className="relative group">
              <button
                onClick={() => navigate("/notifications")}
                className={`relative text-2xl cursor-pointer transition duration-200 ${location.pathname === "/notifications" ? "text-red-400" : "text-white hover:text-red-400"}`}
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
                  className={`flex items-center gap-1 font-medium px-4 py-1.5 rounded text-2xl hover:text-red-400 transition cursor-pointer ${
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
                  <div className="absolute right-0 mt-3 w-65 bg-gray-800/95 backdrop-blur-lg border border-gray-500 rounded-2xl shadow-lg py-2 z-50 text-lg ">
                    <ul className="flex flex-col divide-y divide-gray-900">
                      {menuItems.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => handleMenuClick(item.label)}
                          className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition duration-200 ease-in-out rounded-lg ${
                            activeMenu === item.label
                              ? "bg-green-900 text-red-300"
                              : "hover:bg-gray-600"
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
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer transition hover:bg-gray-600 text-md font-medium rounded-lg"
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
                className="font-medium bg-red-700 hover:bg-red-800 text-white px-5 py-1.5 rounded-lg text-lg "
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
