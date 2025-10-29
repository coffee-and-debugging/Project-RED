import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ---------- DUMMY DATA ----------
const donationStats = [
  { month: "Jan 21", donations: 620 },
  { month: "Feb 21", donations: 820 },
  { month: "Mar 21", donations: 580 },
  { month: "Apr 21", donations: 720 },
  { month: "May 21", donations: 540 },
  { month: "Jun 21", donations: 640 },
  { month: "Jul 21", donations: 900 },
  { month: "Aug 21", donations: 750 },
  { month: "Sep 21", donations: 680 },
  { month: "Oct 21", donations: 720 },
  { month: "Nov 21", donations: 560 },
  { month: "Dec 21", donations: 420 },
];

const requestVsReceived = [
  { group: "O+", request: 32, received: 26 },
  { group: "O-", request: 7, received: 4 },
  { group: "A+", request: 21, received: 17 },
  { group: "A-", request: 16, received: 11 },
  { group: "B+", request: 28, received: 19 },
  { group: "B-", request: 19, received: 15 },
  { group: "AB+", request: 22, received: 16 },
  { group: "AB-", request: 14, received: 9 },
];

const requests = [
  {
    id: 1,
    avatar: "https://i.pravatar.cc/48?img=32",
    time: "13 min ago",
    message: "Emergency blood needed for car accident victim.",
    type: "O+",
  },
  {
    id: 2,
    avatar: "https://i.pravatar.cc/48?img=12",
    time: "13 min ago",
    message: "Emergency blood needed for car accident victim.",
    type: "O+",
  },
  {
    id: 3,
    avatar: "https://i.pravatar.cc/48?img=5",
    time: "1 hour ago",
    message: "B+ blood needed in 3 hours 🙏",
    type: "B+",
  },
  {
    id: 4,
    avatar: "https://i.pravatar.cc/48?img=7",
    time: "1 hour ago",
    message: "Blood needed for accident victim.",
    type: "O+",
  },
  {
    id: 5,
    avatar: "https://i.pravatar.cc/48?img=10",
    time: "37 min ago",
    message: "Save a mother’s life. Urgent AB+",
    type: "AB+",
  },
];

const donors = [
  {
    id: 1,
    name: "Darlene Steward",
    time: "11:32 AM",
    avatar: "https://i.pravatar.cc/48?img=44",
    type: "O+",
  },
  {
    id: 2,
    name: "Brooklyn Simmons",
    time: "11:32 AM",
    avatar: "https://i.pravatar.cc/48?img=66",
    type: "B+",
  },
  {
    id: 3,
    name: "Olivia Wilson",
    time: "10:15 AM",
    avatar: "https://i.pravatar.cc/48?img=21",
    type: "A+",
  },
  {
    id: 4,
    name: "James Anderson",
    time: "9:50 AM",
    avatar: "https://i.pravatar.cc/48?img=51",
    type: "AB-",
  },
];

// ---------- COMPONENT ----------
const HospitalDashboard = () => {
  
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="mt-6 flex gap-6">
          {/* ---------- LEFT COLUMN ---------- */}
          <aside className="w-96 flex-shrink-0 space-y-6">
            {/* Recent Requests */}
            <div className="bg-white rounded-2xl shadow-md p-4 pb-1">
              <h4 className="text-lg font-semibold mb-3 text-gray-800">
                Recent Blood Requests
              </h4>
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-hide">
                {requests.map((it) => (
                  <li
                    key={it.id}
                    className="relative flex items-start gap-3 bg-[#e4f0f0] rounded-lg p-3 "
                  >
                    <img
                      src={it.avatar}
                      alt={it.type}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">{it.time}</div>
                      <p className="text-sm text-gray-700">{it.message}</p>
                    </div>
                    <span className="absolute top-0 right-0 bg-[#ff6b2d] text-white px-2 py-1 rounded-bl-md rounded-tr-lg text-xs font-semibold shadow-sm">
                      {it.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Donors */}
            <div className="bg-white rounded-2xl shadow-md p-4 pb-1">
              <h4 className="text-lg font-semibold mb-3 text-gray-800">
                Recent Blood Donors
              </h4>
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-hide">
                {donors.map((d) => (
                  <li
                    key={d.id}
                    className="relative flex items-start gap-3 bg-[#e4f0f0] rounded-lg p-3"
                  >
                    <img
                      src={d.avatar}
                      alt={d.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{d.name}</div>
                      <div className="text-xs text-gray-400">{d.time}</div>
                    </div>
                    <span className="absolute top-0 right-0 bg-[#06b6d4] text-white px-2 py-1 rounded-bl-md rounded-tr-lg text-xs font-semibold shadow-sm">
                      {d.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ---------- RIGHT CONTENT ---------- */}
          <main className="flex-1 space-y-6">
            {/* Donation Statistics */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Donation Statistics
                </h3>
                <div className="flex items-center gap-3">
                  <div className="bg-[#f0f6f6] border border-[#e6f1f1] rounded-md px-3 py-1 text-sm text-gray-600 cursor-pointer">
                    Blood Type: All ▾
                  </div>
                  <select className="bg-[#f0f6f6] border border-[#e6f1f1] rounded-md px-3 py-1 text-sm text-gray-600 cursor-pointer">
                    <option>Year</option>
                    <option>2021</option>
                  </select>
                </div>
              </div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={donationStats}
                    margin={{ top: 6, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#edf4f4" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="donations"
                      fill="#ff6b2d"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Request vs Received */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">
                  Blood Request vs Received
                </h4>
                <div className="bg-[#f0f6f6] border border-[#e6f1f1] px-3 py-1 rounded-md text-sm text-gray-600 cursor-pointer">
                  Today ▾
                </div>
              </div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={requestVsReceived}
                    margin={{ top: 6, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#edf4f4" />
                    <XAxis dataKey="group" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="request"
                      fill="#06b6d4"
                      radius={[6, 6, 0, 0]}
                      barSize={18}
                    />
                    <Bar
                      dataKey="received"
                      fill="#ff6b2d"
                      radius={[6, 6, 0, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-3 rounded bg-[#06b6d4] inline-block" />
                  Request
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-3 rounded bg-[#ff6b2d] inline-block" />
                  Received
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
