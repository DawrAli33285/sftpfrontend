import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const adminToken = localStorage.getItem("adminToken");

  
  if (!adminToken || adminToken === "") {
    return <Navigate to="/adminlogin" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;