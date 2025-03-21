import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Device {
  id: string;
  name: string;
  device_id: string;
  location: string;
  status: 'active' | 'inactive' | 'error';
  last_transmission?: string;
}

export const DeviceSelector: React.FC<{
  onDeviceSelect: (device: Device) => void;
}> = ({ onDeviceSelect }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserDevices();
  }, [user]);

  const fetchUserDevices = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setDevices(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching devices",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDeviceHealth = (device: Device) => {
    if (device.status === 'error') return 'text-red-500';
    if (device.status === 'inactive') return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleDeviceSelect = (device: Device) => {
    if (device.status === 'active') {
      setSelectedDevice(device);
      onDeviceSelect(device);
    } else {
      toast({
        variant: "destructive",
        title: "Device Unavailable",
        description: "This device is not currently active."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading devices...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Device</CardTitle>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <p className="text-center text-gray-500">
            No devices found. Add a new device to get started.
          </p>
        ) : (
          <div className="grid gap-4">
            {devices.map((device) => (
              <Button
                key={device.id}
                variant={selectedDevice?.id === device.id ? 'default' : 'outline'}
                className={`w-full justify-between ${checkDeviceHealth(device)}`}
                onClick={() => handleDeviceSelect(device)}
              >
                <div className="flex items-center space-x-4">
                  <span className="font-bold">{device.name}</span>
                  <span className="text-sm text-gray-500">{device.location}</span>
                </div>
                <span className="text-sm">{device.status}</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};