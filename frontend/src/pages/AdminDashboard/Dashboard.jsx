import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import AdminSidebar from "./AdminSidebar";

const DashboardCard = ({ number, label, color }) => (
  <div className={`bg-${color}-600 text-white rounded-lg p-6 text-center shadow-md`}>
    <h2 className="text-3xl font-bold">{number}</h2>
    <p className="mt-2">{label}</p>
  </div>
);

const chartData = [
  { name: "Jan", donors: 10 },
  { name: "Feb", donors: 15 },
  { name: "Mar", donors: 22 },
  { name: "Apr", donors: 30 },
  { name: "May", donors: 28 },
  { name: "Jun", donors: 40 },
];

const Dashboard = () => {
  return (
    <div className={`flex flex-col lg:flex-row bg-gray-900 text-white min-h-screen`}>
      <AdminSidebar />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Hello Super Admin</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div className="bg-indigo-600 p-6 rounded-lg text-center text-white shadow-md">
            <h3 className="text-3xl font-bold">5</h3>
            <p className="mt-2">New Donors Today</p>
          </div>
          <div className="bg-green-600 p-6 rounded-lg text-center text-white shadow-md">
            <h3 className="text-3xl font-bold">2</h3>
            <p className="mt-2">Hospitals Added</p>
          </div>
          <div className="bg-yellow-600 p-6 rounded-lg text-center text-white shadow-md">
            <h3 className="text-3xl font-bold">10</h3>
            <p className="mt-2">Pending Queries</p>
          </div>
          <div className="bg-pink-600 p-6 rounded-lg text-center text-white shadow-md">
            <h3 className="text-3xl font-bold">1</h3>
            <p className="mt-2">System Alerts</p>
          </div>
        </div>


        <div className="bg-yellow-200 text-yellow-900 p-4 mt-10 rounded-lg shadow-sm">
          📢 Reminder: Approve pending hospital registrations!
        </div>

      
        <div className="mt-10 p-6 rounded-lg bg-gray-800 shadow-md text-center items-center">
          <h2 className="text-xl font-semibold mb-4 text-white">Monthly Donor Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Line type="monotone" dataKey="donors" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        
        <div className="mt-10 flex flex-wrap gap-4">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md">
            Add Donor
          </button>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md">
            Add Hospital
          </button>
        </div>

        
        <div className="bg-gray-800 rounded-lg p-6 mt-10 text-white shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>User "john_doe" registered as donor</span>
              <span className="text-sm text-gray-400">2 hrs ago</span>
            </li>
            <li className="flex justify-between">
              <span>Hospital "Red Cross" added</span>
              <span className="text-sm text-gray-400">5 hrs ago</span>
            </li>
            <li className="flex justify-between">
              <span>User "amit123" submitted a query</span>
              <span className="text-sm text-gray-400">8 hrs ago</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-10">
          <DashboardCard number="22" label="Blood Donors Available" color="indigo" />
          <DashboardCard number="10" label="User Queries" color="green" />
          <DashboardCard number="5" label="User Queries" color="yellow" />
          <DashboardCard number="1" label="User Queries" color="pink" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
