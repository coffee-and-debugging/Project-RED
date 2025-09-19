import React from "react";

import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DonarDashboard from "./pages/HospitalDashboard/DonarDashboard";
import PatientDashboard from "./pages/HospitalDashboard/PatientDashboard";
import HospitalDashboard from "./pages/HospitalDashboard/HospitalDashboard";
import Home from "./components/home/Home";
import About from "./components/about/About";
import WhyDonate from "./components/whydonate/WhyDonate";
import Dashboard from "./pages/AdminDashboard/Dashboard";
import DonorList from "./pages/AdminDashboard/DonorList";
import AddHospital from "./pages/AdminDashboard/AddHospital";
import MyAccount from "./components/myAccount/MyAccount";
import HospitalList from "./pages/AdminDashboard/HospitalList";
import BloodRequest from "./components/blood/BloodRequest";
import Compatibility from "./components/Compatibility/Compatibility";
import NavBar from "./components/nav/NavBar";
import HospitalRegister from "./components/Auth/HospitalRegister";
import Notifications from "./components/Common/Notifications";
import ChatRoomsList from "./components/Common/ChatRoomsList";
import ChatRoom from "./components/Common/ChatRoom";
import DonateBlood from "./components/blood/DonateBlood";
import HosSidebar from "./pages/HospitalDashboard/HosSidebar";
import HospiNavBar from "./pages/HospitalDashboard/HospiNavBar";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<NavBar />}>
          <Route path="/register" element={<Register />} />
          <Route path="/hospital_register" element={<HospitalRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/why-donate" element={<WhyDonate />} />
          <Route path="/blood-request" element={<BloodRequest />} />
          <Route
            path="/blood-request/edit/:requestId"
            element={<BloodRequest />}
          />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/blood-compatibility" element={<Compatibility />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chat-rooms" element={<ChatRoomsList />} />
          <Route path="/chat-rooms/:id" element={<ChatRoom />} />
          <Route path="/patients-request" element={<DonateBlood />} />
        </Route>

        {/* Hospital Routes */}
        <Route element={<HosSidebar />}>
          <Route path="/donar-dashboard" element={<DonarDashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<Dashboard />} />
        <Route path="/donor-lists" element={<DonorList />} />
        <Route path="/add-hospitals" element={<AddHospital />} />
        <Route path="/hospital-lists" element={<HospitalList />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
