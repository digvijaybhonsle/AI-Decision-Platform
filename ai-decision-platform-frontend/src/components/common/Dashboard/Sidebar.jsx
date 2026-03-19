import React, { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Cpu,
  Brain,
  GitCompare,
  Lightbulb,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Lists = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Upload Dataset", icon: Upload, path: "/upload-dataset" },
  { name: "Train Model", icon: Cpu, path: "/train-model" },
  { name: "Predictions", icon: Brain, path: "/predict" },
  { name: "Scenario Simulator", icon: GitCompare, path: "/simulate" },
  { name: "Insights", icon: Lightbulb, path: "/insights" },
];

const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleActive = (index, path) => {
    setActiveIndex(index);
    navigate(path);
  };

  return (
    <div className="w-64 sticky top-0 h-screen bg-[#0F172A] flex flex-col justify-between p-6">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 text-white text-xl font-semibold mb-10">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-500">
            AI
          </div>
          <span>Decision</span>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {Lists.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                onClick={() => handleActive(index, item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                ${
                  activeIndex === index
                    ? "text-white bg-[#1E293B]"
                    : "text-gray-400 hover:text-white hover:bg-[#1E293B]"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <button className="flex items-center gap-3 cursor-pointer text-gray-400 hover:text-white hover:bg-red-500/20 w-full px-4 py-3 rounded-lg transition">
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
