import React, { useState } from "react";
import { MdAddCircleOutline, MdCheckCircle, MdCancel, MdDelete } from "react-icons/md";

const initialRequests = [
  {
    id: 1,
    patientName: "Ram Bahadur",
    bloodGroup: "A+",
    hospitalWard: "Ward 3 - Bed 12",
    units: 2,
    status: "Pending",
    requestDate: "2025-09-20",
  },
  {
    id: 2,
    patientName: "Sita Karki",
    bloodGroup: "O-",
    hospitalWard: "Ward 1 - Bed 5",
    units: 1,
    status: "Fulfilled",
    requestDate: "2025-09-18",
  },
  {
    id: 3,
    patientName: "Bikash Rai",
    bloodGroup: "B+",
    hospitalWard: "ICU - Bed 2",
    units: 3,
    status: "Rejected",
    requestDate: "2025-09-15",
  },
];

const PatientDashboard = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    patientName: "",
    bloodGroup: "",
    hospitalWard: "",
    units: 1,
    status: "Pending",
    requestDate: new Date().toISOString().split("T")[0],
  });

  // ✅ Open Add Request Modal
  const handleOpenModal = (req = null) => {
    if (req) {
      setFormData(req); // edit
    } else {
      setFormData({
        id: null,
        patientName: "",
        bloodGroup: "",
        hospitalWard: "",
        units: 1,
        status: "Pending",
        requestDate: new Date().toISOString().split("T")[0],
      });
    }
    setShowModal(true);
  };

  // ✅ Save Request
  const handleSave = () => {
    if (!formData.patientName || !formData.bloodGroup || !formData.hospitalWard)
      return;

    if (formData.id) {
      setRequests((prev) =>
        prev.map((r) => (r.id === formData.id ? formData : r))
      );
      // axios.put(`/api/patient-requests/${formData.id}/`, formData)
    } else {
      const newRequest = { ...formData, id: Date.now() };
      setRequests((prev) => [...prev, newRequest]);
      // axios.post("/api/patient-requests/", newRequest)
    }
    setShowModal(false);
  };

  // ✅ Delete Request
  const handleDelete = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    // axios.delete(`/api/patient-requests/${id}/`)
  };

  // ✅ Update Status
  const handleStatus = (id, status) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    // axios.patch(`/api/patient-requests/${id}/`, { status })
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Patient Requests</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <MdAddCircleOutline size={20} />
          New Request
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4 text-gray-700 bg-blue-100 p-1 px-2 rounded-md w-fit">
          All Blood Requests
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3">Patient</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Ward/Bed</th>
                <th className="p-3">Units</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{req.patientName}</td>
                  <td className="p-3">{req.bloodGroup}</td>
                  <td className="p-3">{req.hospitalWard}</td>
                  <td className="p-3">{req.units}</td>
                  <td className="p-3">{req.requestDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        req.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "Fulfilled"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-3">
                    {req.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleStatus(req.id, "Fulfilled")}
                          className="text-green-600 hover:text-green-800"
                          title="Mark Fulfilled"
                        >
                          <MdCheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleStatus(req.id, "Rejected")}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          <MdCancel size={20} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenModal(req)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Delete"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    No patient requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">
              {formData.id ? "Edit Request" : "New Request"}
            </h2>
            <div className="mb-3">
              <label className="block text-sm font-medium">Patient Name</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) =>
                  setFormData({ ...formData, patientName: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) =>
                  setFormData({ ...formData, bloodGroup: e.target.value })
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
              <label className="block text-sm font-medium">Ward/Bed</label>
              <input
                type="text"
                value={formData.hospitalWard}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalWard: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium">Units Required</label>
              <input
                type="number"
                min={1}
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
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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

export default PatientDashboard;
