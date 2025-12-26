import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import BloodTestForm from "./BloodTestForm";
// ---------- COMPONENT ----------
const HospitalDashboard = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);

  const token = localStorage.getItem("hospitalToken");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch recent donors
      const donorsRes = await axios.get(
        "http://127.0.0.1:8000/api/hospital-dashboard/donors/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = donorsRes.data.results || donorsRes.data || [];
      const sortedDonors = [...data].sort((a,b) => { const aDate = new Date(a.assigned_at);
        const bDate = new Date(b.assigned_at);
        return bDate - aDate;
      });
      setDonors(sortedDonors);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [token]);
  
  // Mark as completed
  const markAsCompleted = async (assignmentId) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/hospital-dashboard/assignments/${assignmentId}/mark_completed/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.dismiss();
      toast.success("Marked as completed successfully!");
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to mark as completed.");
      console.error(err);
    }
  };

  // Open Blood test form
  const openBloodTestForm = (donor) => {
    setSelectedDonor(donor);
    setShowForm(true);
  };

  const handleBloodTestSubmit = async (data) =>{
    if(!selectedDonor) return;
    const isUpdate = selectedDonor.blood_test_exists;
    const toastId = toast.loading(isUpdate ? "Updating blood test..." : "Submitting blood test...");
    try{
      const payload = {...data, life_saved: data.life_saved ?? false};
      const url = isUpdate ? `http://127.0.0.1:8000/api/hospital-dashboard/assignments/${selectedDonor.assignment_id}/update_blood_test/` : `http://127.0.0.1:8000/api/hospital-dashboard/assignments/${selectedDonor.assignment_id}/submit_blood_test/`;
        await axios({
          method: isUpdate ? "put" : "post",
          url, data: payload, headers: { Authorization: `Bearer ${token}`,
       },
        });
        toast.update(toastId, {render: isUpdate ? "Blood test updated successfully!" :"Blood test submitted successfully!", type: "success", isLoading: false, autoClose: 2000});
      setShowForm(false);
      setTimeout(() => {
        window.location.reload();
      },2000);
    } catch (err) {
       console.error("Error submitting blood test:",err);
       toast.update(toastId, {
        render: isUpdate
          ? "Failed to update blood test."
          : "Failed to submit blood test.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  // ✅ GENERATE AI PREDICTION
  const generatePrediction = async (assignmentId) => {
    try {
      toast.info("Generating AI prediction...");
      await axios.post(
        `http://127.0.0.1:8000/api/blood-tests/${assignmentId}/predict/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("AI Prediction generated successfully!");
      fetchData();
      // Optional: refresh donor list
    } catch (err) {
      toast.error("Failed to generate AI prediction!");
      console.error(err);
    }
  };

  // ✅ VIEW PREDICTION
  const viewPrediction = (donor) => {
    setSelectedDonor(donor);
    setPredictionDialogOpen(true);
  };

  //  Close Modals
  const closePredictionDialog = () => setPredictionDialogOpen(false);
  const closeForm = () => setShowForm(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading donors...
      </div>
    );
  }
  return (
    <div className="min-h-screen p-6">
      {/* <Toaster position="bottom-right" reverseOrder={false} /> */}
      <div className="mx-auto max-w-7xl">
        {donors.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            No donors assigned yet.
          </div>
        ) : (
          <div className="mt-6 flex gap-6">
            {/* ---------- LEFT COLUMN ---------- */}
            <aside className="w-full flex-shrink-0 space-y-6">
              {/* Recent Requests */}
              <div className="bg-white rounded-2xl shadow-md p-4 pb-1">
                <h4 className="text-lg font-bold mb-3 text-gray-800">
                  Recent Blood Requests
                </h4>
                <div className="overflow-x-auto rounded-xl shadow-md pb-4 mb-2">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-2">Donor Name</th>
                        <th className="px-2 py-2">Blood Type</th>
                        <th className="px-2 py-2">Age/Gender</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2">Blood Test</th>
                        <th className="px-2 py-2">Life Saved</th>
                        <th className="px-2 py-2">Completed</th>
                        <th className="px-2 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-center">
                      {donors.map((donor) => (
                        <tr
                          key={donor.assignment_id}
                          className="hover:bg-gray-50"
                        >
                          <td className="py-4">
                            {donor.first_name} {donor.last_name}
                          </td>
                          <td className="py-4 font-semibold text-center">
                            <span className="outline outline-red-600 text-red-600 rounded-full px-2 py-1">
                              {donor.blood_group}
                            </span>
                          </td>
                          <td className="py-4">
                            {donor.age}/{donor.gender}
                          </td>
                          <td className="py-4 text-center">
                            <span
                              className={`px-3 py-2 rounded-full text-sm font-medium text-white ${
                                donor.assignment_status === "completed"
                                  ? "bg-green-700"
                                  : "bg-sky-600"
                              }`}
                            >
                              {donor.assignment_status === "completed"
                                ? "Completed"
                                : "Scheduled"}
                            </span>
                          </td>

                          <td className="py-4 text-center">
                            <span
                              className={`px-3 py-2 rounded-full text-sm font-medium text-white ${
                                donor.blood_test_exists
                                  ? "bg-green-700"
                                  : "bg-orange-500"
                              }`}
                            >
                              {donor.blood_test_exists
                                ? "Completed"
                                : "Pending"}
                            </span>
                          </td>

                          <td className="py-4 text-center">
                            <span
                              className={`px-3 py-2 rounded-full text-sm font-medium ${
                                donor.life_saved
                                  ? "bg-green-700 text-white"
                                  : "bg-gray-100 text-black"
                              }`}
                            >
                              {donor.life_saved ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            {donor.completed_at
                              ? new Date(donor.completed_at)
                                  .toISOString()
                                  .split("T")[0]
                              : "—"}
                          </td>

                          <td className="px-4 py-4 flex flex-col gap-2">
                            {donor.blood_test_exists ? (
                              <>
                                <button
                                  className="px-2 py-1 border border-red-600 rounded text-sm uppercase cursor-pointer"
                                  onClick={() => viewPrediction(donor)}
                                >
                                  View Prediction
                                </button>
                                <button
                                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm uppercase cursor-pointer"
                                  onClick={() => openBloodTestForm(donor, true)}
                                >
                                  Edit Test
                                </button>
                                {donor.assignment_status !== "completed" && (
                                  <button
                                    className="px-2 py-1 border border-green-500 text-green-700 rounded text-sm uppercase cursor-pointer"
                                    onClick={() =>
                                      markAsCompleted(donor.assignment_id)
                                    }
                                  >
                                    Mark Completed
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                className="px-2 py-1 bg-green-500 text-gray-50 font-semibold rounded text-sm uppercase cursor-pointer"
                                onClick={() => openBloodTestForm(donor)}
                              >
                                Submit Test
                              </button>
                            )}
                            {donor.blood_test_exists &&
                              !donor.blood_test?.health_risk_prediction && (
                                <button
                                  className="px-2 py-1 border border-purple-500 text-purple-500 rounded text-sm uppercase"
                                  onClick={() =>
                                    generatePrediction(donor.assignment_id)
                                  }
                                >
                                  Generate AI Prediction
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {predictionDialogOpen && selectedDonor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 border-b border-gray-200 p-4 pl-6">
              <h2 className="text-xl font-semibold">
                Health Prediction for {selectedDonor.first_name}{" "}
                {selectedDonor.last_name}
              </h2>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              {selectedDonor.blood_test ? (
                <>
                  <h3 className="font-semibold text-xl mb-3">
                    Blood Test Result:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-gray-700 mb-4 border-1 p-3 rounded-2xl border-red-200 text-sm">
                    <p>
                      <strong>Sugar Level:</strong>{" "}
                      {selectedDonor.blood_test.sugar_level} mg/dL
                    </p>
                    <p>
                      <strong>Hemoglobin:</strong>{" "}
                      {selectedDonor.blood_test.hemoglobin} g/dL
                    </p>
                    <p>
                      <strong>Uric Acid:</strong>{" "}
                      {selectedDonor.blood_test.uric_acid_level} mg/dL
                    </p>
                    <p>
                      <strong>WBC Count:</strong>{" "}
                      {selectedDonor.blood_test.wbc_count}
                    </p>
                    <p>
                      <strong>RBC Count:</strong>{" "}
                      {selectedDonor.blood_test.rbc_count}
                    </p>
                    <p>
                      <strong>Platelet Count:</strong>{" "}
                      {selectedDonor.blood_test.platelet_count}
                    </p>
                  </div>

                  {selectedDonor.blood_test.life_saved && (
                    <p className="text-green-700 font-bold mb-3">
                      🎉 Life Saved: This donation helped save a life!
                    </p>
                  )}

                  {selectedDonor.blood_test.health_risk_prediction ? (
                    <>
                      <h4 className="font-semibold mb-2">Health Analysis:</h4>
                      <p className="bg-gray-100 p-3 rounded-lg whitespace-pre-wrap mb-2">
                        {selectedDonor.blood_test.health_risk_prediction}
                      </p>
                      {selectedDonor.blood_test.prediction_confidence && (
                        <p className="text-gray-600 text-sm">
                          <strong>Confidence:</strong>{" "}
                          {selectedDonor.blood_test.prediction_confidence}%
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">
                      Health prediction is being generated...
                    </p>
                  )}
                </>
              ) : (
                <p>No blood test data available.</p>
              )}
            </div>

            <div className="sticky bottom-0 border-t border-gray-200 p-4 flex justify-end mt-4">
              <button
                onClick={closePredictionDialog}
                className="bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BloodTestForm
        open={showForm} // important!
        initialData={selectedDonor} // optional if editing
        onClose={closeForm}
        onSubmit={handleBloodTestSubmit}
        isEdit={selectedDonor?.blood_test_exists}
      />

      <ToastContainer position="top-right" />
    </div>
  );
};

export default HospitalDashboard;
