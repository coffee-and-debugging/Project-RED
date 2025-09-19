// Sidebar.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiInfo, FiMenu } from "react-icons/fi";
import { MdBloodtype } from "react-icons/md";
import { CiMedicalCross } from "react-icons/ci";
import { FaRegCalendarAlt, FaTint, FaUserPlus, FaUsers } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [dateTime, setDateTime] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;

  // Check Login status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Update date and time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const date = now.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const time = now.toLocaleTimeString();
      setDateTime(`${date} ${time}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Main Navigation Links
  const navLinks = [
    { label: "Home", icon: <FiHome />, to: "/" },
    { label: "About Us", icon: <FiInfo />, to: "/about" },
    { label: "Why Donate Blood", icon: <FaTint />, to: "/why-donate" },
    { label: "Blood Compatibility", icon: <MdBloodtype />, to: "/blood-compatibility" },
    // { label: "Chat Room", icon: <BsChatDots />, to: "/chat-rooms"}
  ];

  return (
    <div
      className={`hidden lg:flex fixed top-0 left-0 bg-gray-800 h-screen shadow-lg transition-all duration-300 z-50 ${
        isSidebarOpen ? "w-66" : "w-25"
      } overflow-hidden flex-col`}
    >

      {/* Logo */}
      <div className="relative">
        <div className="flex items-center justify-center gap-3 p-4 pb-6">
          <img
            src="/logo.png"
            alt="LOGO"
            className={`transition-all duration-300 cursor-pointer ${
              isSidebarOpen ? "w-10" : "w-13 mx-auto"
            }`} onClick={() => navigate("/")}
          />
          {isSidebarOpen && (
            <span className="text-white font-bold text-lg whitespace-nowrap">
              Project R.E.D
            </span>
          )}
        </div>
        <div
          className="h-0.5 bg-gray-600 w-full absolute bottom-1"
          style={{ height: "2px" }}
        ></div>
      </div>

      {/* Date & Toggle Button */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        {isSidebarOpen ? (
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <FaRegCalendarAlt className="text-lg" />
            <span>{dateTime}</span>
          </div>
        ) : (
          <div />
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-2xl text-white cursor-pointer hover:text-blue-300 transition duration-300"
        >
          <FiMenu />
        </button>
      </div>

      {/* Navigation Links Menus */}
      <div className="flex flex-col items-start p-4 space-y-4 pt-4">
        {navLinks.map((item, i) => (
          <Link
            to={item.to}
            key={i}
            className={`group flex items-center p-2 rounded-md hover:bg-gray-700 text-white w-full transition-all duration-200 hover:text-red-400 ${
              currentPath === item.to
                ? "bg-red-800"
                : "hover:bg-gray-700 "
            } font-medium text-lg ${
              isSidebarOpen ? "gap-4" : "justify-center"
            }`}
          >
            <span
              className={` ${
                isSidebarOpen ? "text-xl" : "text-2xl"
              } flex items-center justify-center`}
            >
              {item.icon}
            </span>
            {isSidebarOpen && (
              <span
                className={`transition-all duration-300 transform group-hover:translate-x-3`}
              >
                {item.label}
              </span>
            )}
          </Link>
        ))}

        {/* Conditional Auth Links */}
        {/* Blood Request Menu */}
        {isLoggedIn && (
          <Link
            to="/blood-request"
            onClick={() => setMobileMenuOpen(false)}
            className={`group flex items-center p-2 rounded-md hover:bg-gray-700 text-white w-full transition-all duration-200 hover:text-red-400 font-medium text-lg ${
              currentPath === "/blood-request"
                ? "bg-red-800 text-white"
                : "text-white hover:bg-gray-700"
            } ${isSidebarOpen ? "gap-4" : "justify-center"}`}
          >
            <span
              className={`${
                isSidebarOpen ? "text-xl" : "text-2xl"
              } flex items-center justify-center`}
            >
              <CiMedicalCross />
            </span>
            {isSidebarOpen && (
              <span
                className={`transition-all duration-300 transform group-hover:translate-x-3`}
              >
                Blood Request
              </span>
            )}
          </Link>
        )}

        {/* Register Menu */}
        {!isLoggedIn && (
          <Link
            to="/register"
            className={`group flex items-center p-2 rounded-md hover:bg-gray-700 text-white w-full transition-all duration-200 hover:text-red-400 font-medium text-lg ${
              currentPath === "/register" || currentPath === "/hospital_register"
                ? "bg-red-800 text-white"
                : "text-white hover:bg-gray-700"
            } ${isSidebarOpen ? "gap-4" : "justify-center"}`}
          >
            <span
              className={`${
                isSidebarOpen ? "text-xl" : "text-2xl"
              } flex items-center justify-center`}
            >
              <FaUserPlus />
            </span>
            {isSidebarOpen && (
              <span
                className={`transition-all duration-300 transform group-hover:translate-x-3`}
              >
                Register Now
              </span>
            )}
          </Link>
        )}

        {/* Patients Requests Menu */}
        {isLoggedIn && (
          <Link
            to="/patients-request"
            className={`group flex items-center p-2 rounded-md hover:bg-gray-700 text-white w-full transition-all duration-200 hover:text-red-400 font-medium text-lg ${
              currentPath === "/patients-request"
                ? "bg-red-800 text-white"
                : "text-white hover:bg-gray-700"
            } ${isSidebarOpen ? "gap-4" : "justify-center"}`}
          >
            <span
              className={`${
                isSidebarOpen ? "text-xl" : "text-2xl"
              } flex items-center justify-center`}
            >
              <FaUsers />
            </span>
            {isSidebarOpen && (
              <span
                className={`transition-all duration-300 transform group-hover:translate-x-3`}
              >
                Patients Request
              </span>
            )}
          </Link>
        )}


        {/* Chat room Menu */}
        {isLoggedIn && (
          <Link
            to="/chat-rooms"
            className={`group flex items-center p-2 rounded-md hover:bg-gray-700 text-white w-full transition-all duration-200 hover:text-red-400 font-medium text-lg ${
              currentPath.startsWith("/chat-rooms")
                ? "bg-red-800 text-white"
                : "text-white hover:bg-gray-700"
            } ${isSidebarOpen ? "gap-4" : "justify-center"}`}
          >
            <span
              className={`${
                isSidebarOpen ? "text-xl" : "text-2xl"
              } flex items-center justify-center`}
            >
              <BsChatDots />
            </span>
            {isSidebarOpen && (
              <span
                className={`transition-all duration-300 transform group-hover:translate-x-3`}
              >
                Chat Room
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
