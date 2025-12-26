import React, { use, useEffect, useState } from "react";
import Footer from "../Footer/Footer";
import axios from "axios";

const About = () => {
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
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <section className="py-14 px-8 md:px-20 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-rose-600 mb-6 tracking-tight">
            About Project R.E.D
          </h2>
          <div className="space-y-5 text-lg text-gray-600 leading-relaxed">
          <p>
            <span className="font-semibold text-gray-800">Project RED</span> is a life-saving
            initiative that connects individuals in urgent need of blood with
            nearby donors and hospitals. In a country where access to timely
            blood donations can mean the difference between life and death, we
            aim to bridge the gap with a smarter, faster, and more transparent
            solution.
          </p>
          <p>
            Our platform allows users to register as donors, request blood, or
            verify the availability at partner hospitals. By maintaining a
            real-time, verified network of donors and medical institutions,
            Project RED ensures that blood is available when and where it's
            needed the most.
          </p>
          <p>
            Whether you're a regular donor or someone in need, Project RED
            empowers communities to help each other, creating a nationwide chain
            of compassion and urgency.
          </p>
          <p>
            Our mission is to improve accessibility, encourage regular
            donations, and ultimately{" "}
            <span className="font-semibold text-rose-500">save lives</span> by
            revolutionizing the way Nepal handles blood donations.
          </p>
          </div>
          <div className="mt-10">
            <span className="text-2xl italic text-rose-500 font-bold">
              "Donate a blood, Save a life"
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow px-8 md:px-20 py-16 max-w-6xl mx-auto space-y-20">
        {/* Mission & Vission */}
        <section className="grid md:grid-cols-2 gap-10">
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
            <div key={index} className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <h2 className="text-2xl font-semibold text-rose-600 mb-4">
                {item.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        {/* How it Works */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            How Project RED Works
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 text-center">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition text-center duration-300 transform hover:-translate-y-1"
              >
                <h4 className="text-xl font-semibold text-rose-600 mb-3">
                  {step.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* Call to Action */}
        <section className="text-center pt-12 border-t border-gray-300">
          <p className="text-lg font-medium text-gray-700">
            Join us and become a hero today!
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
