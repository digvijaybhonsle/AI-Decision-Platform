import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { name: "Jan", revenue: 2000 },
  { name: "Feb", revenue: 3200 },
  { name: "Mar", revenue: 4100 },
  { name: "Apr", revenue: 3800 },
  { name: "May", revenue: 5200 },
  { name: "Jun", revenue: 6100 },
];

const ChartInsight = () => {
  return (
    <div>
      {/* Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm col-span-2">
          <h3 className="font-semibold mb-4 text-gray-700">Revenue Trend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-700">AI Insights</h3>

          <ul className="space-y-4 text-sm text-gray-600">
            <li>📈 Revenue predicted to grow 12% next month</li>
            <li>⚠️ Customer churn risk detected</li>
            <li>🚀 Demand spike predicted in Q3</li>
            <li>📊 Model accuracy improved by 4%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChartInsight;
