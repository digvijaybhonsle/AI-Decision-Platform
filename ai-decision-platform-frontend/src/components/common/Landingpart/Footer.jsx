import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white px-12 py-8">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo + Description */}
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"></div>
            <span>AI Decision</span>
          </div>

          <p className="text-blue-200 text-sm leading-relaxed">
            AI-powered decision intelligence platform that helps businesses
            predict outcomes, simulate scenarios, and gain powerful insights
            from data.
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h3 className="font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li className="hover:text-white cursor-pointer">Features</li>
            <li className="hover:text-white cursor-pointer">Pricing</li>
            <li className="hover:text-white cursor-pointer">Integrations</li>
            <li className="hover:text-white cursor-pointer">API</li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">Blog</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li className="hover:text-white cursor-pointer">Documentation</li>
            <li className="hover:text-white cursor-pointer">Help Center</li>
            <li className="hover:text-white cursor-pointer">Community</li>
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="border-t border-white mt-12 pt-6 text-center text-blue-300 text-sm">
        © {new Date().getFullYear()} AI Decision Platform. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;