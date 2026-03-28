import React, { useState } from "react";
import Sidebar from "../components/common/Dashboard/Sidebar";
import Navbardash from "../components/common/Dashboard/Navbardash";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static z-50 top-0 left-0 h-full w-64 bg-white
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* NAVBAR */}
        <div className="flex items-center justify-between shadow">
          
          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <Navbardash />
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;