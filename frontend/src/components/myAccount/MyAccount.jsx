import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowRight,
  FaHistory,
  FaTint,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import DonationHistory from "./DonationHistory";
import RequestHistory from "./RequestHistory";
import { FiLogOut } from "react-icons/fi";

const MyAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "Profile";
  const [activeMenu, setActiveMenu] = useState(defaultTab);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab") || "Profile";
    setActiveMenu(tab);
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    // Simulated API response
    const fetchUser = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        const users = await res.json();

        if (users.results && users.results.length > 0) {
          setUser(users.results[0]);
        } else {
          throw new Error("No user data found");
        }
      } catch (error) {
        console.error(error);
        alert("Failed to fetch user data. Please Login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleMenuClick = (label) => {
    setActiveMenu(label);
    setSearchParams({ tab: label });

    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const menuItems = [
    {
      label: "Profile",
      icon: <FaUser />,
      active: true,
      color: "text-gray-500",
    },

    { label: "Donation History", icon: <FaHistory />, color: "text-green-300" },
    { label: "Blood Requests", icon: <FaTint />, color: "text-red-400" },
  ];

  if (!user)
    return (
      <div className="p-6 text-center font-bold text-2xl text-blue-300">
        Loading...
      </div>
    );

  return (
    <div className="sticky top-0 z-0 bg-[#1e1e1e] text-white font-sans">
      <div className="md:hidden flex justify-start px-4 py-2 bg-gray-900 sticky top-17">
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className="bg-white dark:bg-gray-800 p-2 rounded-full shadow"
        >
          <FaArrowRight size={20} className="text-white" />
        </button>
      </div>

      {showSidebar && (
        <div
          className="fixed inset-0 bg-opacity-50 bg-white/30 dark:bg-black/20 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div className="min-h-screen md:flex bg-gray-900 text-gray-800 dark:text-gray-100">
        <aside
          className={`md:hidden fixed rounded-xl left-0 z-0 w-64 transition-transform duration-300 transform ${
            showSidebar ? "translate-x-0 z-50" : "-translate-x-full"
          } md:relative md:translate-x-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-6 overflow-y-auto rounded-r-xl top-18 h-[calc(100vh-4rem)] md:top-0 md:h-screen`}
        >
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li
                key={index}
                onClick={() => handleMenuClick(item.label)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition duration-200 ease-in-out ${
                  activeMenu === item.label
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <span className={`text-xl ${item.color}`}>{item.icon}</span>
                <span className="text-md font-medium">{item.label}</span>
              </li>
            ))}

            <li
              onClick={() => {
                const confirmed = window.confirm(
                  "Are you sure you want to delete your account? This action cannot be undone."
                );
                if (confirmed) {
                  alert("Your account has been deleted.");
                  localStorage.removeItem("token");
                  navigate("/login");
                }
              }}
              className="flex items-center gap-3 px-4 py-2 cursor-pointer transition text-red-300 rounded-lg hover:bg-gray-700 text-md font-medium"
            >
              <FaTrash className="text-xl text-red-500" /> Delete Account
            </li>

            <li
              onClick={() => {
                const confirm = window.confirm(
                  "Are you sure you want to logout your account?"
                );
                if (confirm) {
                  alert("Your account has been logout.");
                  localStorage.removeItem("token");
                  navigate("/login");
                }
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition hover:bg-gray-700 text-md font-medium
                "
            >
              <FiLogOut className="text-xl text-blue-400" /> Log Out
            </li>
          </ul>
        </aside>

        {/* Details show */}
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">
            {activeMenu === "Settings" ? (
              <>
                Account <span className="text-green-600">Settings</span>
              </>
            ) : activeMenu === "Donation History" ? (
              <>
                My <span className="text-green-600">Donations</span>
              </>
            ) : activeMenu === "Blood Requests" ? (
              <>
                Request <span className="text-green-600">History</span>
              </>
            ) : activeMenu === "Change Password" ? (
              <>
                Change <span className="text-green-600">Password</span>
              </>
            ) : (
              <>
                My <span className="text-green-600">Profile</span>
              </>
            )}
          </h1>

          {activeMenu === "Settings" && <EditProfile user={user} />}
          {activeMenu === "Donation History" && (
            <DonationHistory donations={user.donations} />
          )}
          {activeMenu === "Blood Requests" && (
            <RequestHistory requests={user.requests} />
          )}
          {activeMenu === "Change Password" && <ChangePassword />}

          {/* User Profile Information */}
          {activeMenu === "Profile" && (
            <>
              <div className="bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center mb-6">
                  <img
                    src={
                      user.gender === "F"
                        ? "/femaleavatar.jpg"
                        : user.gender === "M"
                        ? "/maleavatar.jpg"
                        : "/defaultavatar.png"
                    }
                    alt="avatar"
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />

                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.first_name} {user.last_name}
                    </h2>
                  </div>
                </div>

                <table className="w-full table-auto">
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 font-semibold w-40">Role</td>
                      <td className="py-3">Donor</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-3 font-semibold">Username</td>
                      <td className="py-3">{user.username}</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-3 font-semibold">Email</td>
                      <td className="py-3 flex items-center gap-2">
                        {user.email}
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-3 font-semibold">Phone</td>
                      <td className="py-3 flex items-center gap-2">
                        +{user.phone_number}
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-3 font-semibold">Address</td>
                      <td className="py-3 flex items-center gap-2">
                        {user.address}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Blood Group</td>
                      <td className="py-3 flex items-center gap-2">
                        {user.blood_group}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <li
                onClick={() => {
                  const confirmed = window.confirm(
                    "Are you sure you want to delete your account? This action cannot be undone."
                  );
                  if (confirmed) {
                    alert("Your account has been deleted.");
                    localStorage.removeItem("token");
                    navigate("/login");
                  }
                }}
                className="flex border w-2/6 md:w-2/11 items-center gap-3 px-4 py-2 mt-5 rounded-md cursor-pointer transition text-red-500 hover:bg-red-500 hover:text-white text-md font-medium"
              >
                <FaTrash className="text-xl" /> Delete Account
              </li>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyAccount;
