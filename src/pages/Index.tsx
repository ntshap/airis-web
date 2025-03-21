import { useSensorData } from "@/hooks/use-sensor-data";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Header } from "@/components/Header";
import { AirQualityWarning } from "@/components/AirQualityWarning";
import { Chatbot } from "@/components/Chatbot";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Index = () => {
  const { data } = useSensorData();
  const latestData = data[data.length - 1] || { 
    co2: 0, 
    pm25: 0, 
    co: 0, 
    temperature: 0, 
    humidity: 0 
  };

  const getStatus = (type: "co2" | "pm25" | "co" | "temperature" | "humidity", value: number) => {
    const thresholds = {
      co2: { warning: 1000, danger: 2000, max: 5000 },
      pm25: { warning: 35, danger: 50 },
      co: { warning: 5, danger: 10 },
      temperature: { warning: 27, danger: 30 },
      humidity: { warning: 30, danger: 20 },
    };

    if (value >= thresholds[type].danger) return "danger";
    if (value >= thresholds[type].warning) return "warning";
    return "good";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-dashboard-background dark:bg-dashboard-background-light text-white dark:text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <AirQualityWarning 
          co2={latestData.co2}
          pm25={latestData.pm25}
          co={latestData.co}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatusIndicator
            label="CO₂"
            value={latestData.co2}
            unit="ppm"
            status={getStatus("co2", latestData.co2)}
          />
          <StatusIndicator
            label="PM2.5"
            value={latestData.pm25}
            unit="µg/m³"
            status={getStatus("pm25", latestData.pm25)}
          />
          <StatusIndicator
            label="CO"
            value={latestData.co}
            unit="ppm"
            status={getStatus("co", latestData.co)}
          />
          <StatusIndicator
            label="Temperature"
            value={latestData.temperature}
            unit="°C"
            status={getStatus("temperature", latestData.temperature)}
          />
          <StatusIndicator
            label="Humidity"
            value={latestData.humidity}
            unit="%"
            status={getStatus("humidity", latestData.humidity)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dashboard-card dark:bg-dashboard-card-light rounded-lg p-4 h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Air Quality Metrics</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#373737" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#666" 
                  tickFormatter={formatTimestamp}
                />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#25262b", 
                    border: "none",
                    borderRadius: "8px",
                    color: "white"
                  }}
                  labelFormatter={formatTimestamp}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="co2" 
                  stroke="#00ff00" 
                  name="CO₂ (ppm)"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="pm25" 
                  stroke="#ff9900" 
                  name="PM2.5 (µg/m³)"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="co" 
                  stroke="#ff0000" 
                  name="CO (ppm)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dashboard-card dark:bg-dashboard-card-light rounded-lg p-4 h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Temperature & Humidity</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#373737" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#666" 
                  tickFormatter={formatTimestamp}
                />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#25262b", 
                    border: "none",
                    borderRadius: "8px",
                    color: "white"
                  }}
                  labelFormatter={formatTimestamp}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#3b82f6" 
                  name="Temperature (°C)"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#8b5cf6" 
                  name="Humidity (%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Chatbot />
      </div>
    </div>
  );
};

export default Index;