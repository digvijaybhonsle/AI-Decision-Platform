import React from "react";
import { Search, Bell, User } from "lucide-react";

const Navbardash = () => {
  return (
    <div className="w-full h-16 sticky top-0 z-90 backdrop-blur-md flex items-center justify-between px-8 bg-[#0F172A]/80 border-b border-gray-700 text-[#F8FAFC] gap-140">

      {/* Search Bar */}
      <div className="flex items-center bg-[#1E293B] px-4 py-2 rounded-lg w-80">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search insights..."
          className="bg-transparent outline-none text-sm w-full placeholder-gray-400"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-300 hover:text-white transition" />

          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-[#1E293B] px-3 py-2 rounded-lg transition">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User size={16} />
          </div>
          <span className="text-sm font-medium hidden md:block">
            John Doe
          </span>
        </div>

      </div>

    </div>
  );
};

export default Navbardash;