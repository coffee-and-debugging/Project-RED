import React, { useState, useEffect } from "react";
import axios from "axios";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Get token from localStorage (assumes you stored JWT as 'token')
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token) {
        console.error("No token found, user is not authenticated.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        "http://127.0.0.1:8000/api/donations/?expand=blood_test",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const donations = res.data.results || res.data;

      // Filter only donations with blood_test
      const userReports = donations
        .filter((d) => d.blood_test)
        .map((d) => ({
          ...d.blood_test,
          donationDate: d.donation_date || d.created_at,
          hospital: d.hospital_name,
          donationId: d.id,
        }));

      setReports(userReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      if (err.response && err.response.status === 401) {
        alert("Unauthorized! Please login first.");
      }
    } finally {
      setLoading(false);
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-300 p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Blood Test Reports
        </h2>

        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p>No reports available yet.</p>
            <p className="text-gray-500 mt-2">
              Your blood test reports will appear here after analysis.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
                onClick={() => viewReport(report)}
              >
                <h3 className="font-semibold text-lg">
                  Blood Test -{" "}
                  {new Date(report.donationDate).toLocaleDateString()}
                </h3>
                <p className="text-gray-600">
                  Hospital: {report.hospital || "Unknown"}
                </p>

                {report.prediction_summary && (
                  <p className="text-gray-800 mb-2">{report.prediction_summary}</p>
                )}

                {report.health_risk_prediction && (
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Confidence: </span>
                    {report.prediction_confidence}%
                  </p>
                )}

                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer" onClick={() => viewReport(report)}>View Details</button>
              </div>
            ))}
          </div>
        )}

        {/* Dialog */}
        {dialogOpen && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
            <div className="bg-white w-full max-w-3xl p-6 rounded-2xl shadow-lg relative overflow-y-auto max-h-[90vh]">
              <button
                className="absolute top-4 right-4 text-gray-600 text-2xl font-bold"
                onClick={() => setDialogOpen(false)}
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-4">
                Blood Test -{" "}
                {new Date(selectedReport.donationDate).toLocaleDateString()}
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <p>
                  <strong>Hemoglobin:</strong> {selectedReport.hemoglobin}
                </p>
                <p>
                  <strong>WBC:</strong> {selectedReport.wbc_count}
                </p>
                <p>
                  <strong>Platelets:</strong> {selectedReport.platelet_count}
                </p>
                <p>
                  <strong>Sugar Level:</strong> {selectedReport.sugar_level}
                </p>
                <p>
                  <strong>Uric Acid:</strong> {selectedReport.uric_acid_level}
                </p>
                {selectedReport.life_saved && (
                  <p className="col-span-2 text-green-600 font-semibold">
                    🎉 Life Saved: This donation was used to save a life!
                  </p>
                )}
              </div>

              <h4 className="text-lg font-semibold mb-2">Health Analysis:</h4>
              <p className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap mb-2">
                {selectedReport.health_risk_prediction}
              </p>
              {selectedReport.prediction_confidence && (
                <p className="text-gray-600">
                  Confidence: {selectedReport.prediction_confidence}%
                </p>
              )}

              <div className="mt-4 text-right">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
