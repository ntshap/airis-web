import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AirQualityWarningProps {
  co2: number;
  pm25: number;
  co: number;
}

export const AirQualityWarning = ({ co2, pm25, co }: AirQualityWarningProps) => {
  const getWarnings = () => {
    const warnings = [];
    
    if (co2 > 1000) {
      warnings.push({
        title: "High CO₂ Levels",
        description: "Open windows to improve ventilation",
      });
    }
    
    if (pm25 > 25) {
      warnings.push({
        title: "High PM2.5 Levels",
        description: "Activate air purifier",
      });
    }
    
    if (co > 9) {
      warnings.push({
        title: "High CO Levels",
        description: "Check ventilation system immediately",
      });
    }
    
    return warnings;
  };

  const warnings = getWarnings();

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((warning, index) => (
        <Alert key={index} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{warning.title}</AlertTitle>
          <AlertDescription>{warning.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};