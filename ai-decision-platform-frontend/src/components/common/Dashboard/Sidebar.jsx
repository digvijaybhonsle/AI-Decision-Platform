import React from "react";
import {
  LayoutDashboard,
  Upload,
  Cpu,
  Brain,
  GitCompare,
  Lightbulb,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Upload Dataset", icon: Upload, path: "/upload-dataset" },
  { name: "Train Model", icon: Cpu, path: "/train-model" },
  { name: "Predictions", icon: Brain, path: "/predict" },
  { name: "Scenario Simulator", icon: GitCompare, path: "/simulate" },
  // { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Insights Dashboard", icon: Lightbulb, path: "/insights" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();

    navigate("/login");
  };

  return (
    <div
      className="h-screen bg-[#0F172A] text-white flex flex-col justify-between transition-all duration-300 
      w-64 p-6"
    >
      {/* TOP */}
      <div>
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3 text-xl font-semibold">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-500">
                AI
              </div>
              <span>Decision</span>
            </div>
        </div>

        {/* MENU */}
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all
                ${
                  isActive
                    ? "bg-[#1E293B] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1E293B]"
                }`}
              >
                <Icon size={20} />

                {/* Hide text when collapsed */}
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 cursor-pointer rounded-lg text-gray-400 hover:text-white hover:bg-red-500/20 transition"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
