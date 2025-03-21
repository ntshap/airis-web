import { useSensorData } from "@/hooks/use-sensor-data";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Header } from "@/components/Header";

interface SensorData {
  timestamp: string;
  co2: number;
  pm25: number;
  co: number;
  temperature: number;
  humidity: number;
}

export const DashboardAnalytics = () => {
  // Destructure the returned object
  const { data: sensorData, loading, error } = useSensorData();

  const calculateSummary = (parameter: keyof SensorData) => {
    const numericValues = sensorData
      .map(data => Number(data[parameter]))
      .filter(value => !isNaN(value));

    if (numericValues.length === 0) {
      return { avg: '0', max: '0', min: '0' };
    }

    const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);

    return { 
      avg: avg.toFixed(1), 
      max: max.toFixed(1), 
      min: min.toFixed(1) 
    };
  };

  const parameterDetails = {
    co2: { color: "#00ff00", unit: "ppm", risk: "Indicates indoor air ventilation" },
    pm25: { color: "#ff9900", unit: "µg/m³", risk: "Potential respiratory hazard" },
    co: { color: "#ff0000", unit: "ppm", risk: "Dangerous at high levels" },
    temperature: { color: "#3b82f6", unit: "°C", risk: "Comfort and health indicator" },
    humidity: { color: "#8b5cf6", unit: "%", risk: "Mold and comfort zone" }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl flex items-center">
          <svg 
            className="animate-spin h-8 w-8 mr-3" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading sensor data...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-2xl text-center">
          <p>Error loading sensor data</p>
          <p className="text-sm text-gray-400 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty data state
  if (sensorData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl text-center">
          <p>No sensor data available</p>
          <p className="text-sm text-gray-400 mt-2">Please check your sensor connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Header />
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center text-white">Detailed Air Quality Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(Object.keys(parameterDetails) as Array<keyof typeof parameterDetails>).map(param => {
            const summary = calculateSummary(param);
            const details = parameterDetails[param];

            return (
              <div 
                key={param} 
                className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wider text-gray-200">
                    {param} Analysis
                  </h2>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Average</p>
                      <p className="text-2xl font-bold text-white">
                        {summary.avg}
                        <span className="text-sm text-gray-500 ml-1">{details.unit}</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Maximum</p>
                      <p className="text-2xl font-bold text-white">
                        {summary.max}
                        <span className="text-sm text-gray-500 ml-1">{details.unit}</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Minimum</p>
                      <p className="text-2xl font-bold text-white">
                        {summary.min}
                        <span className="text-sm text-gray-500 ml-1">{details.unit}</span>
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4 text-center italic">
                    {details.risk}
                  </p>
                  
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sensorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#1f2937", 
                            border: "none",
                            borderRadius: "12px",
                            color: "white",
                            padding: "12px"
                          }}
                        />
                        <Bar dataKey={param} fill={details.color} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};