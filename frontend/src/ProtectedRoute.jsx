// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("hospitalToken"); // token for hospital login
  if (!token) {
    return <Navigate to="/hospital-login" replace />; // redirect to hospital login
  }
  return children;
};

export default ProtectedRoute;
