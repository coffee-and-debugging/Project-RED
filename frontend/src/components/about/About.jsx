import React, { use, useEffect, useState } from "react";
import Footer from "../Footer/Footer";
import axios from "axios";

const About = () => {
  const [stats, setStats] = useState({
    visitors: 0,
    units: 0,
    users: 0,
    hospitals: 0,
  });


  const howItWorks = [
    {
      title: "1. Register & Verify",
      description:
        "Donors, patients, and hospitals create verified accounts with essential medical info and location details.",
    },
    {
      title: "2. Request or Donate",
      description:
        "Patients can post urgent blood requests. Donors near the location are instantly notified and can respond.",
    },
    {
      title: "3. Connect & Help",
      description:
        "Once a match is made, real-time details are shared securely so that help reaches in time every time.",
    },
  ];
  

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white font-sans flex flex-col">
      <section className="bg-gray-800 py-12 px-6 md:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-red-600 mb-6">
            About Project R.E.D
          </h2>
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            <span className="font-semibold">Project RED</span> is a life-saving
            initiative that connects individuals in urgent need of blood with
            nearby donors and hospitals. In a country where access to timely
            blood donations can mean the difference between life and death, we
            aim to bridge the gap with a smarter, faster, and more transparent
            solution.
          </p>
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            Our platform allows users to register as donors, request blood, or
            verify the availability at partner hospitals. By maintaining a
            real-time, verified network of donors and medical institutions,
            Project RED ensures that blood is available when and where it's
            needed the most.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Whether you're a regular donor or someone in need, Project RED
            empowers communities to help each other, creating a nationwide chain
            of compassion and urgency.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Our mission is to improve accessibility, encourage regular
            donations, and ultimately{" "}
            <span className="font-semibold text-red-400">save lives</span> by
            revolutionizing the way Nepal handles blood donations.
          </p>
          <div className="mt-8">
            <span className="text-2xl italic text-red-400 font-bold">
              "Donate a blood, Save a life"
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow px-6 md:px-20 py-16 max-w-6xl mx-auto space-y-16">
        {/* Mission & Vission */}
        <section className="grid md:grid-cols-2 gap-12">
          {[
            {
              title: "Our Mission",
              description:
                "To ensure that no life is lost due to unavailability of blood. We aim to build a strong network of voluntary donors and healthcare providers, promoting awareness and quick access to critical resources.",
            },
            {
              title: "Our Vision",
              description:
                "A Nepal where every patient in need of blood can be helped within minutes not hours. A society where blood donation becomes a part of everyday life, guided by technology, compassion, and trust.",
            },
          ].map((item, index) => (
            <div key={index} className="border border-gray-600 p-7 rounded-md">
              <h2 className="text-2xl font-semibold text-red-500 mb-4">
                {item.title}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        {/* How it Works */}
        <section>
          <h2 className="text-2xl font-semibold text-red-500 mb-6 text-center">
            How Project RED Works
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="bg-[#1f2937] p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <h4 className="text-xl font-bold text-red-400 mb-2">
                  {step.title}
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* Call to Action */}
        <section className="text-center pt-10 border-t border-gray-700">
          <p className="text-lg font-semibold">
            Join us and become a hero today!
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
