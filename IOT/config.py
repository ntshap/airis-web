import os
import logging
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', "https://cghzdaaevsmlppngucbe.supabase.co")
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaHpkYWFldnNtbHBwbmd1Y2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5Mjk3NTksImV4cCI6MjA1NDUwNTc1OX0.uM6GwrfJ6Te1xg_W_MNfX2P-1VNftgpFFojzXrdB2M8")

# ESP32 Sensor GPIO Pin Configuration
DHT_PIN = 27          # GPIO2 for DHT22 (Digital pin)
MQ135_PIN = 35       # GPIO35 (ADC1_CH7) for MQ135 (CO2)
MQ7_PIN = 32         # GPIO32 (ADC1_CH4) for MQ7 (CO)
GP2Y1014AU_PIN = 34  # GPIO34 (ADC1_CH6) for GP2Y1014AU (PM2.5)

# ADC Configuration
ADC_ATTEN = 3        # ADC attenuation (3 = 11dB, full range)
ADC_WIDTH = 4095     # 12-bit ADC (0-4095)

# Sampling Configuration
SAMPLING_INTERVAL = 30  # seconds between readings
MAX_RETRIES = 3        # maximum number of retry attempts for failed readings

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'sensor_logs.txt')

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Device Configuration
DEVICE_ID = os.getenv('DEVICE_ID', f'AIRIS_ESP32_{os.urandom(4).hex()}')
DEVICE_LOCATION = os.getenv('DEVICE_LOCATION', 'default_location')

# Sensor Calibration Factors
SENSOR_CALIBRATION: Dict[str, Dict[str, float]] = {
    'mq7': {
        'slope': 99.042,
        'intercept': -1.518,
        'r0': 27.5
    },
    'mq135': {
        'slope': 110.47,
        'intercept': -2.862,
        'r0': 3.6
    }
}

# Error Thresholds
SENSOR_THRESHOLDS: Dict[str, Dict[str, Any]] = {
    'co2': {
        'min': 400,    # ppm
        'max': 5000,   # ppm
        'alert_level': {
            'warning': 1000,
            'critical': 2000
        }
    },
    'pm25': {
        'min': 0,      # μg/m³
        'max': 500,    # μg/m³
        'alert_level': {
            'warning': 35,
            'critical': 50
        }
    },
    'co': {
        'min': 0,      # ppm
        'max': 100,    # ppm
        'alert_level': {
            'warning': 25,
            'critical': 50
        }
    },
    'temperature': {
        'min': -20,    # °C
        'max': 50,     # °C
        'alert_level': {
            'warning': {'low': 10, 'high': 35},
            'critical': {'low': 0, 'high': 40}
        }
    },
    'humidity': {
        'min': 0,      # %
        'max': 100,    # %
        'alert_level': {
            'warning': {'low': 20, 'high': 80},
            'critical': {'low': 10, 'high': 90}
        }
    }
}

def validate_sensor_reading(sensor_type: str, value: float) -> bool:
    """
    Validate sensor reading against defined thresholds
    
    Args:
        sensor_type (str): Type of sensor
        value (float): Sensor reading value
    
    Returns:
        bool: Whether the reading is within acceptable range
    """
    if sensor_type not in SENSOR_THRESHOLDS:
        logger.warning(f"No thresholds defined for sensor type: {sensor_type}")
        return True
    
    thresholds = SENSOR_THRESHOLDS[sensor_type]
    is_valid = thresholds['min'] <= value <= thresholds['max']
    
    if not is_valid:
        logger.error(f"Sensor {sensor_type} reading {value} out of range")
    
    return is_valid

def get_sensor_alert_level(sensor_type: str, value: float) -> str:
    """
    Determine alert level for a sensor reading
    
    Args:
        sensor_type (str): Type of sensor
        value (float): Sensor reading value
    
    Returns:
        str: Alert level (normal/warning/critical)
    """
    if sensor_type not in SENSOR_THRESHOLDS:
        return 'normal'
    
    thresholds = SENSOR_THRESHOLDS[sensor_type]['alert_level']
    
    if isinstance(thresholds['warning'], dict):
        # For multi-range thresholds like temperature and humidity
        if (value < thresholds['warning']['low'] or 
            value > thresholds['warning']['high']):
            return 'warning'
        if (value < thresholds['critical']['low'] or 
            value > thresholds['critical']['high']):
            return 'critical'
    else:
        # For single-range thresholds like CO2, PM2.5, CO
        if value >= thresholds['critical']:
            return 'critical'
        if value >= thresholds['warning']:
            return 'warning'
    
    return 'normal'

# Optional: Environment-specific overrides
try:
    from local_config import *
except ImportError:
    pass