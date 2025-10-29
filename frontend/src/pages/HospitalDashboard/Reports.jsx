import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const Reports = () => {
  // Dummy Data
  const summary = {
    donors: 120,
    patients: 85,
    donations: 340,
    requests: 210,
  };

  const bloodData = [
    { group: "A+", value: 50 },
    { group: "B+", value: 40 },
    { group: "O+", value: 70 },
    { group: "AB+", value: 20 },
    { group: "A-", value: 10 },
    { group: "B-", value: 15 },
    { group: "O-", value: 25 },
    { group: "AB-", value: 5 },
  ];

  const trendData = [
    { month: "Jan", donations: 30, requests: 20 },
    { month: "Feb", donations: 40, requests: 25 },
    { month: "Mar", donations: 35, requests: 30 },
    { month: "Apr", donations: 50, requests: 45 },
    { month: "May", donations: 60, requests: 55 },
  ];

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const users = [
    { id: 1, name: "Ram Sharma", role: "Donor", blood: "A+", lastActivity: "2025-09-01", status: "Active" },
    { id: 2, name: "Sita Thapa", role: "Patient", blood: "O-", lastActivity: "2025-09-10", status: "Pending" },
    { id: 3, name: "Krishna Koirala", role: "Donor", blood: "B+", lastActivity: "2025-09-15", status: "Active" },
    { id: 4, name: "Anita Gurung", role: "Patient", blood: "AB+", lastActivity: "2025-09-12", status: "Fulfilled" },
  ];

  const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#facc15", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"];

  const filteredUsers = users.filter((u) => {
    return (
      (filter === "all" || u.role.toLowerCase() === filter) &&
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Reports</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: "Total Donors", value: summary.donors, color: "bg-red-500" },
          { label: "Total Patients", value: summary.patients, color: "bg-blue-500" },
          { label: "Total Donations", value: summary.donations, color: "bg-green-500" },
          { label: "Total Requests", value: summary.requests, color: "bg-yellow-500" },
        ].map((card, i) => (
          <div key={i} className={`${card.color} text-white rounded-xl p-6 shadow`}>
            <h2 className="text-lg font-medium">{card.label}</h2>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Donations by Blood Group</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={bloodData} dataKey="value" outerRadius={100} label>
                {bloodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Requests vs Donations</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="donations" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All</option>
          <option value="donor">Donors</option>
          <option value="patient">Patients</option>
        </select>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Blood Group</th>
              <th className="p-3">Last Activity</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.blood}</td>
                <td className="p-3">{user.lastActivity}</td>
                <td
                  className={`p-3 font-semibold ${
                    user.status === "Active"
                      ? "text-green-600"
                      : user.status === "Pending"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}
                >
                  {user.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
