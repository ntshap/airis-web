import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Header } from "@/components/Header";

const generateEnergyData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
    energySaved: Math.random() * 10,
    hvacUsage: Math.random() * 100
  }));
};

export const EnergyConsumptionTracker = () => {
  const energyData = generateEnergyData();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Header />
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center text-white">Energy Consumption & Savings</h1>
        
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-400">Average HVAC Usage</p>
              <p className="text-2xl font-bold text-white">
                {(energyData.reduce((sum, d) => sum + d.hvacUsage, 0) / energyData.length).toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">kWh</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Total Energy Saved</p>
              <p className="text-2xl font-bold text-green-400">
                {energyData.reduce((sum, d) => sum + d.energySaved, 0).toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">kWh</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Energy Efficiency</p>
              <p className="text-2xl font-bold text-blue-400">
                {((energyData.reduce((sum, d) => sum + d.energySaved, 0) / 
                   energyData.reduce((sum, d) => sum + d.hvacUsage, 0)) * 100).toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">%</span>
              </p>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666" 
                  className="text-gray-400"
                />
                <YAxis 
                  stroke="#666" 
                  className="text-gray-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1f2937", 
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    padding: "12px"
                  }}
                  labelClassName="text-gray-300"
                />
                <Legend 
                  wrapperStyle={{ color: "white" }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="energySaved" 
                  stroke="#82ca9d" 
                  name="Energy Saved (kWh)"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hvacUsage" 
                  stroke="#8884d8" 
                  name="HVAC Usage (kWh)"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};