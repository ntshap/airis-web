// src/lib/api.ts
import { supabase } from './supabase'

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

export const sensorAPI = {
  async getSensorData(deviceId?: string): Promise<SensorData[]> {
    let query = supabase
      .from('sensor_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    // Optional device filtering
    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as SensorData[];
  },

  async getDevices(userId: string) {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error;
    return data;
  },

  async getPredictions(sensorData: Partial<SensorData>) {
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sensorData)
      });

      if (!response.ok) {
        throw new Error('Prediction request failed');
      }

      return response.json();
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }
}