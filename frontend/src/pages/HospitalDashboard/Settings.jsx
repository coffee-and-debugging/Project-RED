import React, { useState } from "react";
import { MdAccountCircle, MdOutlineSettings, MdBuild, MdContentCopy } from "react-icons/md";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    logo: null,
    logoPreview: null,
    name: "City Hospital",
    email: "cityhospital@example.com",
    phone: "9876543210",
    address: "Kathmandu, Nepal",
    notifications: true,
    darkMode: false,
    language: "English",
    defaultBloodGroup: "O+",
    apiKey: "ABC123XYZ",
    integrations: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "logo" && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        logo: files[0],
        logoPreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(formData.apiKey);
    alert("API Key copied to clipboard!");
  };

  const handleSave = () => {
    console.log("Saved settings:", formData);
    // axios.put("/api/hospital/settings", formData)
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings?")) {
      // Reset to defaults or fetch from backend
      setFormData((prev) => ({ ...prev, logo: null, logoPreview: null }));
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">⚙️ Hospital Settings</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {[
          { key: "profile", label: "Profile", icon: <MdAccountCircle /> },
          { key: "preferences", label: "Preferences", icon: <MdOutlineSettings /> },
          { key: "advanced", label: "Advanced", icon: <MdBuild /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition ${
              activeTab === tab.key
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-6">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Hospital Logo</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleChange}
                className="block mb-2"
              />
              {formData.logoPreview && (
                <img
                  src={formData.logoPreview}
                  alt="Logo Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Hospital Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
            <button
              onClick={handleSave}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition col-span-2"
            >
              Save Profile
            </button>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === "preferences" && (
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
                className="h-5 w-5 text-green-600"
              />
              <span className="text-sm">Enable Notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="darkMode"
                checked={formData.darkMode}
                onChange={handleChange}
                className="h-5 w-5 text-green-600"
              />
              <span className="text-sm">Enable Dark Mode</span>
            </label>
            <div>
              <label className="text-sm font-medium mb-1 block">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              >
                <option>English</option>
                <option>Nepali</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Default Blood Group for Notifications</label>
              <select
                name="defaultBloodGroup"
                value={formData.defaultBloodGroup}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              >
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Save Preferences
            </button>
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeTab === "advanced" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">🔧 Advanced Settings</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="apiKey"
                value={formData.apiKey}
                readOnly
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
              />
              <button
                onClick={handleCopyApiKey}
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center gap-1"
              >
                <MdContentCopy /> Copy
              </button>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="integrations"
                checked={formData.integrations}
                onChange={handleChange}
                className="h-5 w-5 text-purple-600"
              />
              <span className="text-sm">Enable System Integrations</span>
            </label>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Reset Settings
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Save Advanced Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
