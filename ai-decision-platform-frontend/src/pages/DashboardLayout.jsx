import React from "react";
import Sidebar from "../components/common/Dashboard/Sidebar";
import Navbardash from "../components/common/Dashboard/Navbardash";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">

      {/* Sidebar (fixed width) */}
      <div className="w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Navbar (fixed height) */}
        <div className="shrink-0">
          <Navbardash />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;