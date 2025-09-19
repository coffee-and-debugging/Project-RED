import React from "react";
import { FaTint } from "react-icons/fa";
import Footer from "../Footer/Footer";

const donorTypes = ["O-", "O+", "B-", "B+", "A-", "A+", "AB-", "AB+"];
const recipientData = [
  { recipient: "AB+", compatibility: [1, 1, 1, 1, 1, 1, 1, 1] },
  { recipient: "AB-", compatibility: [1, 0, 1, 0, 1, 0, 1, 0] },
  { recipient: "A+", compatibility: [1, 1, 0, 0, 1, 1, 0, 0] },
  { recipient: "A-", compatibility: [1, 0, 0, 0, 1, 0, 0, 0] },
  { recipient: "B+", compatibility: [1, 1, 1, 1, 0, 0, 0, 0] },
  { recipient: "B-", compatibility: [1, 0, 1, 0, 0, 0, 0, 0] },
  { recipient: "O+", compatibility: [1, 1, 0, 0, 0, 0, 0, 0] },
  { recipient: "O-", compatibility: [1, 0, 0, 0, 0, 0, 0, 0] },
];

const Compatibility = () => {
  return (
    <main className="min-h-screen bg-[#1e1e1e] text-white font-sans">
     
      <div className="max-w-4xl mx-auto px-6 py-10 text-white space-y-10">
        <h1 className="text-4xl font-bold border-b  pb-3 text-red-400 text-center">
          Blood Type Compatibility
        </h1>

        {/* Overview Section */}
        <section className="space-y4 text-gray-300">
          <h2 className="text-2xl font-semibold mb-2 text-white">Overview</h2>
          <p>
            Understanding blood type compatibility is crucial for safe blood
            transfusions. Different blood types have unique antigens and
            antibodies, and not all types are compatible with each other.
          </p>
          <p>
            There are <strong>8 major blood types</strong>: <br /> A+, A-, B+, B-, AB+,
            AB-, O+, and O-. <br />The compatibility depends on antigens (A, B) and
            the Rh factor (positive or negative).
          </p>
        </section>

        {/* Compatibility Chart Section */}
        <section className="overflow-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Blood Type Compatibility Chart
          </h2>
          <div className="grid grid-cols-[60px_1fr] grid-rows-[60px_1fr]">
            <div className="flex items-center justify-center">
                <img src="/logo.png" alt="logo" className="h-12" />
            </div>

            <div className="bg-red-800 text-white font-bold tracking-wider flex justify-center items-center rounded-bl-full">
              <h3>DONOR</h3>
            </div>
            <div className="bg-red-800 flex font-bold items-center justify-center rounded-tr-full">
              <p className="transform -rotate-90 tracking-widest">
                RECIPIENT
              </p>
            </div>
            
            {/* Chart Grid */}
            <div className="inline-block border border-gray-600 rounded-md overflow-hidden">
              <div className="grid grid-cols-9 text-white font-semibold text-sm">
                <div className="p-2 text-center bg-gray-700">Types</div>
                {donorTypes.map((type) => (
                  <div key={type} className="p-2 border border-gray-600 text-center bg-gray-800">{type}</div>
                ))}
                </div>

              {/* Recipient Rows */}
              {recipientData.map(({ recipient, compatibility }) => (
                <div key={recipient} className="grid grid-cols-9 text-sm">
                  <div className="p-2 border border-gray-600 font-semibold bg-gray-800">
                    {recipient}
                  </div>
                  {compatibility.map((val, idx) => (
                    <div
                      key={idx}
                      className="p-2 border border-gray-700 text-center flex justify-center items-center bg-gray-900"
                    >
                      {val ? <FaTint size={20} className="text-red-500" /> : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default Compatibility;
