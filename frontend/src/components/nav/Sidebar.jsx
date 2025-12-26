// Sidebar.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiInfo, FiMenu } from "react-icons/fi";
import { MdBloodtype } from "react-icons/md";
import { CiMedicalCross } from "react-icons/ci";
import { FaRegCalendarAlt, FaTint, FaUserPlus, FaUsers } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { TbReportMedical } from "react-icons/tb";

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
  ];

  // Logged-in Menu
  const loggedNav = [
    { label: "Blood Request", icon: <CiMedicalCross />, to: "/blood-request" },
    { label: "Patients Request", icon: <FaUsers />, to: "/patients-request" },
    { label: "Chat Room", icon: <BsChatDots />, to: "/chat-rooms" },
    { label: "Reports", icon: <TbReportMedical />, to: "/reports" },
  ];

  return (
    <div
      className={`hidden lg:flex fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 shadow-2xl transition-all duration-300 ${
        isSidebarOpen ? "w-66" : "w-25"
      } overflow-hidden flex-col`}
    >

      {/* Logo */}
      <div className={`relative flex items-center justify-between p-4 pb-5 border-b border-gray-700`}>
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="LOGO"
            className={`transition-all duration-300 cursor-pointer ${
              isSidebarOpen ? "w-10" : "w-13 mx-auto"
            }`} onClick={() => navigate("/")}
          />
          {isSidebarOpen && (
            <span className="text-white font-bold text-lg tracking-wide">
              Project R.E.D
            </span>
          )}
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-2xl text-white cursor-pointer hover:text-blue-300 transition duration-300"
        >
          <FiMenu />
        </button>
      </div>

      {/* Date & Toggle Button */}
      
        {isSidebarOpen && (
          <div className="flex items-center gap-2 text-gray-400 font-medium text-sm px-5 py-3 border-b border-gray-700">
            <FaRegCalendarAlt className="text-lg"/>
            <span>{dateTime}</span>
          </div>
        
        )}

      {/* Navigation Links Menus */}
      <div className="flex flex-col mt-4 px-3 space-y-3 overflow-y-auto">
        {navLinks.map((item, i) => (
          <Link
            to={item.to}
            key={i}
            className={`group flex items-center p-3 rounded-xl transition-all duration-300 hover:text-red-200 ${
              currentPath === item.to
                ? "bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg"
                : "text-gray-300 hover:text-red-300 hover:bg-gray-700/60 "
            } font-medium ${
              isSidebarOpen ? "gap-4" : "justify-center"
            }`}
          >
            <span className={` ${ isSidebarOpen ? "text-xl" : "text-2xl" }`}>
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

        {/* Logged-in menus */}
        {isLoggedIn && (
         <>
          {loggedNav.map((item, itm) => (
          <Link
            to={item.to}
            key={itm}
            onClick={() => setMobileMenuOpen(false)}
            className={`group flex items-center p-3 rounded-xl transition-all duration-300 hover:text-red-200 ${
              currentPath === item.to
                ? "bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg"
                : "text-gray-300 hover:text-red-300 hover:bg-gray-700/60 "
            } font-medium ${
              isSidebarOpen ? "gap-4" : "justify-center"
            }`}
          >
            <span
              className={`${
                isSidebarOpen ? "text-xl" : "text-2xl"
              }`}
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
          </>
        )}

        {/* Register Menu */}
        {!isLoggedIn && (
          <Link
            to="/register"
            className={`group flex items-center p-3 rounded-xl transition-all duration-300 hover:text-red-200 font-medium ${
              currentPath === "/register" || currentPath === "/hospital_register"
                ? "bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg"
                : "text-gray-300 hover:text-red-300 hover:bg-gray-700/60"
            } ${isSidebarOpen ? "gap-4" : "justify-center"}`}
          >
            <span
              className={`${
                isSidebarOpen ? "text-xl" : "text-2xl"
              } `}
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
      </div>
    </div>
  );
};

export default Sidebar;
