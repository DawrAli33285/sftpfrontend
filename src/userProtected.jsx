import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const UserRoute = () => {
  // Get the token from localStorage
  const token = localStorage.getItem("token");

  // If token is missing or empty, redirect to login
  if (!token || token === "") {
    return <Navigate to="/login" replace />;
  }

  // Token exists, allow access to the route
  return <Outlet />;
};

export default UserRoute;