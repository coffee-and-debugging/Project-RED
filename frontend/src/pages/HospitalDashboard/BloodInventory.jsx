import React, { useState } from "react";
import { MdAddCircleOutline, MdDelete, MdEdit } from "react-icons/md";

// Dummy data for charts
const initialData = [
  { id: 1, group: "A+", units: 40, updated: "2025-09-20" },
  { id: 2, group: "A-", units: 15, updated: "2025-09-20" },
  { id: 3, group: "B+", units: 30, updated: "2025-09-20" },
  { id: 4, group: "B-", units: 10, updated: "2025-09-20" },
  { id: 5, group: "O+", units: 50, updated: "2025-09-20" },
  { id: 6, group: "O-", units: 20, updated: "2025-09-20" },
  { id: 7, group: "AB+", units: 12, updated: "2025-09-20" },
  { id: 8, group: "AB-", units: 5, updated: "2025-09-20" },
];

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA600",
  "#6A4C93",
  "#FF8C42",
  "#2E86AB",
  "#C70039",
];

const BloodInventory = () => {
  const [bloodData, setBloodData] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, group: "", units: "" });
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("");

  // ✅ Open Add/Edit Modal
  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(item); // edit mode
    } else {
      setFormData({ id: null, group: "", units: "" }); // add mode
    }
    setShowModal(true);
  };

  // ✅ Save Stock (Add or Edit)
  const handleSave = () => {
    if (!formData.group || !formData.units) return;

    if (formData.id) {
      // update
      setBloodData((prev) =>
        prev.map((b) => (b.id === formData.id ? formData : b))
      );
      // axios.put(`http://127.0.0.1:8000/api/blood-inventory/${formData.id}/`, formData)
    } else {
      // add new
      const newEntry = {
        ...formData,
        id: Date.now(),
        updated: new Date().toISOString().split("T")[0],
      };
      setBloodData((prev) => [...prev, newEntry]);
      // axios.post("http://127.0.0.1:8000/api/blood-inventory/", newEntry)
    }
    setShowModal(false);
  };

  // ✅ Delete Stock
  const handleDelete = (id) => {
    setBloodData((prev) => prev.filter((b) => b.id !== id));
    // axios.delete(`http://127.0.0.1:8000/api/blood-inventory/${id}/`)
  };
  // ✅ Filtering & Sorting
  let filteredData = [...bloodData];
  if (filter === "above20") {
    filteredData = filteredData.filter((b) => b.units > 20);
  } else if (filter === "below20") {
    filteredData = filteredData.filter((b) => b.units <= 20);
  }

  if (sort === "most") {
    filteredData.sort((a, b) => b.units - a.units);
  } else if (sort === "least") {
    filteredData.sort((a, b) => a.units - b.units);
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blood Inventory</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition cursor-pointer"
        >
          <MdAddCircleOutline size={20} />
          Add Stock
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <select onChange={(e) => setFilter(e.target.value)} className="w-full md:w-1/4 border rounded-lg px-3 py-2 bg-gray-50 outline-none">
            <option>Filter by Availability</option>
            <option>Above 20 units</option>
            <option>Below 20 units</option>
          </select>
          <select onChange={(e) => setSort(e.target.value)} className="w-full md:w-1/4 border rounded-lg px-3 py-2 bg-gray-50 outline-none">
            <option>Sort by</option>
            <option>Most Units</option>
            <option>Least Units</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4 text-gray-700 bg-[#e4f0f0] p-1 px-2 rounded-md w-fit">
          Detailed Inventory
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3">Blood Group</th>
                <th className="p-3">Available Units</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bloodData.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{item.group}</td>
                  <td className="p-3">{item.units}</td>
                  <td className="p-3">2025-09-20</td>
                  <td className="p-3">
                    {item.units > 20 ? (
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        Sufficient
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <MdEdit size={25} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <MdDelete size={25} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed bg-black/50 inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">
              {FormData.id ? "Edit Stock" : "Add.Stock"}
            </h2>
            <div className="mb-3">
              <label className="block text-sm font-medium">Blood Group</label>
              <select
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">Select Group</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium">Units</label>
              <input
                type="number"
                value={formData.units}
                onChange={(e) =>
                  setFormData({ ...formData, units: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodInventory;
