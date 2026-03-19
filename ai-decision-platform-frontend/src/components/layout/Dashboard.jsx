import React from "react";
import { Brain, BarChart3, FileText, Activity } from "lucide-react";
import ChartInsight from "../common/Dashboard/ChartInsight";
import RecentPredictionTable from "../common/Dashboard/RecentPredictionTable";
import UserGrowthAreaChart from "../common/Dashboard/UserGrowthAreaChart";


const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl text-gray-800">Welcome Back 👋</h1>
        <p className="text-gray-500">
          Here is what's happening with your AI models today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:scale-105 transition flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">AI Predictions</p>
            <h2 className="text-2xl font-bold">1,204</h2>
          </div>
          <Brain className="text-blue-500" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:scale-105 transition flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Reports Generated</p>
            <h2 className="text-2xl font-bold">342</h2>
          </div>
          <FileText className="text-green-500" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:scale-105 transition flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Model Accuracy</p>
            <h2 className="text-2xl font-bold">94.5%</h2>
          </div>
          <BarChart3 className="text-purple-500" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:scale-105 transition flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Active Models</p>
            <h2 className="text-2xl font-bold">12</h2>
          </div>
          <Activity className="text-orange-500" />
        </div>
      </div>

      <ChartInsight />
      <UserGrowthAreaChart />
      <RecentPredictionTable />
    </div>
  );
};

export default Dashboard;
