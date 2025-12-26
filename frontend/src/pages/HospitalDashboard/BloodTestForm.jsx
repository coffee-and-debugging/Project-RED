import React, { useState, useEffect } from "react";

const BloodTestForm = ({ open, onClose, onSubmit, initialData = {}, isEdit}) => {
  if (!open) return null;
  const [formData, setFormData] = useState({
     hemoglobin: initialData?.blood_test?.hemoglobin || "",
    sugar_level: initialData?.blood_test?.sugar_level || "",
    uric_acid_level: initialData?.blood_test?.uric_acid_level || "",
    wbc_count: initialData?.blood_test?.wbc_count || "",
    rbc_count: initialData?.blood_test?.rbc_count || "",
    platelet_count: initialData?.blood_test?.platelet_count || "",
    life_saved: initialData?.blood_test?.life_saved || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      hemoglobin: parseFloat(formData.hemoglobin),
      sugar_level: parseFloat(formData.sugar_level),
      uric_acid_level: parseFloat(formData.uric_acid_level),
      wbc_count: parseInt(formData.wbc_count),
      rbc_count: parseFloat(formData.rbc_count),
      platelet_count: parseInt(formData.platelet_count),
      life_saved: formData.life_saved
    };
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Blood Test Results" : "Submit Blood Test Results"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh] space-y-4">
          <p className="text-gray-600 text-sm mb-4">
            Enter the blood test results for the donor. All fields are required for accurate health prediction.
          </p>

          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Sugar Level (mg/dL)
              </label>
              <input
                type="number"
                name="sugar_level"
                value={formData.sugar_level}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 70–100 mg/dL</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Hemoglobin (g/dL)
              </label>
              <input
                type="number"
                name="hemoglobin"
                value={formData.hemoglobin}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Normal: 13.5–17.5 (M), 12.0–15.5 (F)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Uric Acid Level (mg/dL)
              </label>
              <input
                type="number"
                name="uric_acid_level"
                value={formData.uric_acid_level}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Normal: 3.4–7.0 (M), 2.4–6.0 (F)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                WBC Count (cells/mcL)
              </label>
              <input
                type="number"
                name="wbc_count"
                value={formData.wbc_count}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Normal: 4,500–11,000 cells/mcL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                RBC Count (million cells/mcL)
              </label>
              <input
                type="number"
                name="rbc_count"
                value={formData.rbc_count}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Normal: 4.7–6.1 (M), 4.2–5.4 (F)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Platelet Count (platelets/mcL)
              </label>
              <input
                type="number"
                name="platelet_count"
                value={formData.platelet_count}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Normal: 150,000–450,000 platelets/mcL
              </p>
            </div>
          </div>

          {/* Life Saved Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              name="life_saved"
              checked={formData.life_saved}
              onChange={handleChange}
              className="mr-2 accent-red-600"
            />
            <label className="text-sm">
              Life Saved - This donation was used to save a life
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !formData.sugar_level ||
              !formData.hemoglobin ||
              !formData.uric_acid_level ||
              !formData.wbc_count ||
              !formData.rbc_count ||
              !formData.platelet_count
            }
            className={`${
              !formData.sugar_level ||
              !formData.hemoglobin ||
              !formData.uric_acid_level ||
              !formData.wbc_count ||
              !formData.rbc_count ||
              !formData.platelet_count
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } text-white px-4 py-2 rounded-lg cursor-pointer`}
          >
            {isEdit ? "Update Results" : "Submit Results"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BloodTestForm;
