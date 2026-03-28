import React from "react";
import { Search, Bell, User } from "lucide-react";

const Navbardash = () => {
  return (
    <div className="w-full h-16 sticky top-0 z-40 backdrop-blur-md flex items-center justify-between px-4 md:px-6 bg-[#0F172A]/80 border-b border-gray-700 text-[#F8FAFC]">
      
      {/* LEFT: Search */}
      <div className="flex items-center w-full max-w-xs sm:max-w-sm md:max-w-md bg-[#1E293B] px-3 py-2 rounded-lg">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-full placeholder-gray-400"
        />
      </div>

      {/* RIGHT: Icons */}
      <div className="flex items-center gap-3 md:gap-4 ml-3">
        
        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell className="text-gray-300 hover:text-white transition w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-[#1E293B] px-2 md:px-3 py-1.5 rounded-lg transition">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User size={16} />
          </div>

          {/* Hide name on small screens */}
          <span className="text-sm font-medium hidden sm:block">
            John Doe
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbardash;