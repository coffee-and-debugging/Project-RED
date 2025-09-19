import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";

const AddHospital = () => {
  const [form, setForm] = useState({ name: "", location: "", contact: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Hospital added successfully!\n" + JSON.stringify(form, null, 2));
    setForm({ name: "", location: "", contact: "" });
  };
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <AdminSidebar />
      <div className="flex-1 h-screen overflow-y-auto p-4 md:p-8 mt-4 lg:mt-0">
        <h1 className="text-2xl font-bold mb-6">Add Hospital</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow space-y-4 max-w-4xl mx-auto"
        >
          <div>
            <label className="block font-medium mb-1">Hospital Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white focus:outline-none focus:ring focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white focus:outline-none focus:ring focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Contact Number</label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white focus:outline-none focus:ring focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 cursor-pointer transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHospital;
