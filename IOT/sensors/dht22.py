# dht22.py
import time
import math  # Import math module for isnan
try:
    import machine
    REAL_HARDWARE = True
except ImportError:
    from sensors.mock_hardware import Pin
    REAL_HARDWARE = False

class DHT22Handler:
    def __init__(self, pin):
        if REAL_HARDWARE:
            self.sensor = machine.DHT(machine.Pin(pin), machine.DHT.DHT22)
        else:
            self.sensor = Pin(pin, Pin.IN)

    def read(self):
        try:
            time.sleep(0.2)  # sensor warmup
            if REAL_HARDWARE:
                self.sensor.measure()
                temp = self.sensor.temperature()
                hum = self.sensor.humidity()
            else:
                # Mock values for testing
                temp = 25.0
                hum = 50.0
            
            print(f"DHT22 Raw - Temp: {temp:.2f}°C, Humidity: {hum:.2f}%")
            
            if not (math.isnan(temp) or math.isnan(hum)):  # Use math.isnan
                return {
                    'temperature': round(temp, 2),
                    'humidity': round(hum, 2)
                }
            return None
        except Exception as e:
            print(f"DHT22 error: {e}")
            return None