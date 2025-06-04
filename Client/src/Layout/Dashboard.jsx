import React from "react";
import Navbar from "../Components/Menu/Navbar";
import { Outlet } from "react-router";

const Dashboard = () => {
  return (
    <div className="bg-white z-50">
      <div className="">
        <Navbar></Navbar>
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Dashboard;
