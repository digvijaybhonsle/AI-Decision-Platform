import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 210 },
  { month: "Mar", users: 320 },
  { month: "Apr", users: 450 },
  { month: "May", users: 580 },
  { month: "Jun", users: 720 },
];

const UserGrowthAreaChart = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm w-full">
      <h3 className="font-semibold mb-4 text-gray-700">User Growth</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="users"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={0.3}
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthAreaChart;