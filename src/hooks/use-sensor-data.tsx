import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface SensorData {
  id: string;
  timestamp: string;
  co2: number;
  pm25: number;
  co: number;
  temperature: number;
  humidity: number;
  device_id: string;
}


export function useSensorData() {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial data
    fetchSensorData();

    // Real-time subscription
    const subscription = supabase
      .channel('sensor_data')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sensor_data' 
        },
        (payload) => {
          if (isMounted) {
            setData(current => {
              const newData = [...current, payload.new as SensorData];
              // Keep only the latest 100 records
              return newData.slice(-100);
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchSensorData() {
    try {
      setLoading(true);
      const { data: sensorData, error: supabaseError } = await supabase
        .from('sensor_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (supabaseError) throw supabaseError;

      // Validate and clean data
      const validatedData = (sensorData as SensorData[]).filter(item => 
        item && 
        typeof item.co2 === 'number' && 
        typeof item.pm25 === 'number' && 
        typeof item.temperature === 'number' && 
        typeof item.humidity === 'number'
      );

      setData(validatedData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        variant: "destructive",
        title: "Error fetching sensor data",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  // Add method to manually refresh data
  const refreshData = () => {
    fetchSensorData();
  };

  return {
    data,
    loading,
    error,
    refreshData
  };
}