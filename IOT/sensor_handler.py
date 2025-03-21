# sensor_handler.py
import time
import logging
import requests
import json
from datetime import datetime, UTC
import os
from dotenv import load_dotenv
import uuid
import math

try:
    from machine import ADC, Pin
    REAL_HARDWARE = True
except ImportError:
    from sensors.mock_hardware import ADC, Pin
    REAL_HARDWARE = False

from sensors.mq135 import MQ135
from sensors.mq7 import MQ7
from sensors.gp2y1014au import GP2Y1014AU
from sensors.dht22 import DHT22Handler

# Load environment variables
load_dotenv()

# Configure Logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sensor_debug.log', mode='a'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', "https://cghzdaaevsmlppngucbe.supabase.co")
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

class SensorHandler:
    def __init__(self, device_id='AIRIS_ESP32_01', debug=False):
        self.device_id = device_id
        self.debug_mode = debug
        
        # Arduino exact parameters
        self.MQ7_PARAMS = {
            'A': 99.042,
            'B': -1.518,
            'RATIO_CLEAN_AIR': 27.5,
            'VOLTAGE_RESOLUTION': 5,
            'ADC_BIT_RESOLUTION': 12
        }
        
        self.MQ135_PARAMS = {
            'A': 110.47,
            'B': -2.862,
            'VOLTAGE_RESOLUTION': 5,
            'ADC_BIT_RESOLUTION': 12,
            'RATIO_CLEAN_AIR': 3.6
        }
        
        self.sensor_thresholds = {
            'co2': (400, 5000),
            'pm25': (0, 1000),
            'co': (0, 50),
            'temperature': (0, 50),
            'humidity': (0, 100)
        }
        
        self.init_sensors()
        self.consecutive_errors = 0
        self.MAX_CONSECUTIVE_ERRORS = 3

    def init_sensors(self):
        sensor_configs = [
            ('DHT22', DHT22Handler, 2),
            ('MQ135', MQ135, 35),
            ('MQ7', MQ7, 32),  # Ensure MQ7 is included here
            ('GP2Y1014AU', GP2Y1014AU, 34)
        ]
        
        for sensor_name, sensor_class, pin in sensor_configs:
            try:
                if sensor_name in ['MQ7', 'MQ135']:
                    sensor = sensor_class(pin, self.MQ7_PARAMS if sensor_name == 'MQ7' else self.MQ135_PARAMS)
                else:
                    sensor = sensor_class(pin)
                setattr(self, sensor_name.lower(), sensor)  # Set the attribute
                logger.info(f"{sensor_name} sensor initialized successfully on pin {pin}")
            except Exception as e:
                logger.error(f"Failed to initialize {sensor_name} sensor on pin {pin}: {e}")

    def validate_sensor_data(self, data):
        """Validate and correct sensor data"""
        corrected_data = data.copy()
        
        for key, (min_val, max_val) in self.sensor_thresholds.items():
            if key in data:
                value = float(data[key])
                corrected_data[key] = max(min_val, min(value, max_val))
                corrected_data[key] = round(corrected_data[key], 2)
                
                if value != corrected_data[key]:
                    logger.warning(f"Corrected {key}: {value} -> {corrected_data[key]}")
        
        return corrected_data

    def read_sensors(self):
        try:
            print("\n" + "="*50)
            print("READING SENSORS")
            print("="*50)
            
            # Read GP2Y1014AU (Dust) - Tambahkan konversi ke µg/m³
            print("\nReading Dust Sensor:")
            if hasattr(self, 'gp2y1014au'):
                pm25_value = self.gp2y1014au.read()
                print(f"PM2.5 Value: {pm25_value:.2f} mg/m3")
            else:
                logger.error("GP2Y1014AU sensor not initialized.")
                return None

            # Baca sensor lainnya seperti biasa
            co_value = None
            if hasattr(self, 'mq7'):
                co_value = self.mq7.read_sensor()
                if co_value is None:
                    logger.error("Failed to read MQ7 sensor")
                    return None
            else:
                logger.error("MQ7 sensor not initialized.")
                return None
            
            co2_value = None
            if hasattr(self, 'mq135'):
                co2_raw = self.mq135.read_sensor()
                co2_value = co2_raw + 400
                if co2_value is None:
                    logger.error("Failed to read MQ135 sensor")
                    return None
            else:
                logger.error("MQ135 sensor not initialized.")
                return None
            
            temperature = None
            humidity = None
            if hasattr(self, 'dht22'):
                sensor_data = self.dht22.read()
                if sensor_data:
                    temperature = sensor_data['temperature']
                    humidity = sensor_data['humidity']
                    logger.info(f"Temperature: {temperature} C, Humidity: {humidity} %")
                else:
                    logger.error("Failed to read DHT22 sensor")
                    return None
            else:
                logger.error("DHT22 sensor not initialized.")
                return None
            
            if temperature is None or humidity is None:
                raise ValueError("Failed to read DHT22")
            
            sensor_data = {
                "device_id": self.device_id,
                "temperature": round(float(temperature), 2),
                "humidity": round(float(humidity), 2),
                "co2": round(co2_value, 2),
                "co": round(co_value, 2),
                "pm25": round(pm25_value, 2),  # Nilai yang sudah dikonversi
                "timestamp": datetime.now(UTC).isoformat()
            }

            print("\n" + "="*50)
            print("FINAL READINGS")
            print("="*50)
            print(f"{datetime.now().strftime('%H:%M:%S.%f')[:-3]} -> CO Concentration: {sensor_data['co']:.2f} ppm")
            print(f"{datetime.now().strftime('%H:%M:%S.%f')[:-3]} -> CO2 Concentration: {sensor_data['co2']:.2f} PPM")
            print(f"{datetime.now().strftime('%H:%M:%S.%f')[:-3]} -> Dust Density: {sensor_data['pm25']:.2f} mg/m3")
            print(f"{datetime.now().strftime('%H:%M:%S.%f')[:-3]} -> Temperature: {sensor_data['temperature']:.2f} C")
            print(f"{datetime.now().strftime('%H:%M:%S.%f')[:-3]} -> Humidity: {sensor_data['humidity']:.2f} %")
            print("="*50 + "\n")

            return sensor_data

        except Exception as e:
            logger.error(f"Error reading sensors: {e}")
            return None

    def send_to_supabase(self, data):
        if not data:
            return False

        try:
            # Format data with proper rounding
            formatted_data = {
                "id": str(uuid.uuid4()),
                "timestamp": data["timestamp"],
                "co2": round(float(data["co2"]), 2),
                "pm25": round(float(data["pm25"]), 2),
                "co": round(float(data["co"]), 2),
                "temperature": round(float(data["temperature"]), 2),
                "humidity": round(float(data["humidity"]), 2),
                "device_id": data["device_id"],
                "created_at": datetime.now(UTC).isoformat()
            }

            if self.debug_mode:
                logger.debug(f"Sending data to Supabase: {formatted_data}")

            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/sensor_data",
                json=formatted_data,
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                timeout=10
            )

            response.raise_for_status()
            print("Data sent successfully to Supabase")
            self.consecutive_errors = 0
            return True

        except requests.exceptions.RequestException as e:
            self.consecutive_errors += 1
            logger.error(f"Failed to send data: {e}")
            
            if self.consecutive_errors >= self.MAX_CONSECUTIVE_ERRORS:
                self._save_failed_data(formatted_data)
            
            return False

    def _save_failed_data(self, data):
        """Save failed data submissions to file"""
        try:
            filename = f"failed_data_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            logger.warning(f"Failed data saved to {filename}")
        except Exception as e:
            logger.error(f"Failed to save failed data: {e}")

    def run(self, interval=30):
        print(f"\nStarting sensor handler with {interval} second interval")
        last_send_time = 0
        
        try:
            while True:
                current_time = time.time()
                
                if current_time - last_send_time >= interval:
                    print("\nReading sensors...")
                    sensor_data = self.read_sensors()
                    
                    if sensor_data:
                        if self.send_to_supabase(sensor_data):
                            last_send_time = current_time
                            print("Data successfully sent to Supabase")
                        else:
                            print("Failed to send data to Supabase")
                    else:
                        print("Failed to read sensor data")
                
                time.sleep(1)  # Match Arduino delay
        
        except KeyboardInterrupt:
            print("\nSensor handler stopped by user")
        except Exception as e:
            logger.critical(f"Critical error in sensor handler: {e}")
            raise
        finally:
            self.cleanup()

    def cleanup(self):
        print("\nCleaning up sensor resources")

if __name__ == "__main__":
    try:
        # Set up logging
        logging.getLogger().setLevel(logging.DEBUG)
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(formatter)
        logging.getLogger().addHandler(console_handler)
        
        logger.debug("Starting sensor handler initialization")
        
        # Initialize and run the sensor handler
        handler = SensorHandler(
            device_id="AIRIS_ESP32_01",
            debug=True
        )
        
        logger.debug("Starting sensor handler main loop")
        handler.run()
        
    except Exception as e:
        logger.critical(f"Failed to start sensor handler: {e}")