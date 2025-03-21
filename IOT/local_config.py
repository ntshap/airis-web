# local_config.py
# Local environment-specific configurations and overrides

# Override Supabase credentials (if needed)
# SUPABASE_URL = "your-local-supabase-url"
# SUPABASE_KEY = "your-local-supabase-key"

# Custom device configuration for specific environments
DEVICE_CONFIGURATIONS = {
    'office': {
        'DEVICE_ID': 'AIRIS_OFFICE_01',
        'DEVICE_LOCATION': 'Main Office Conference Room',
        'SAMPLING_INTERVAL': 15,  # More frequent sampling
        'SENSOR_THRESHOLDS': {
            'co2': {
                'max': 1000,  # Lower threshold for office environment
                'alert_level': {
                    'warning': 800,
                    'critical': 1200
                }
            }
        }
    },
    'home': {
        'DEVICE_ID': 'AIRIS_HOME_001',
        'DEVICE_LOCATION': 'Living Room',
        'SAMPLING_INTERVAL': 60,  # Less frequent sampling
        'SENSOR_THRESHOLDS': {
            'temperature': {
                'min': 18,
                'max': 28,
                'alert_level': {
                    'warning': {'low': 20, 'high': 26},
                    'critical': {'low': 15, 'high': 30}
                }
            }
        }
    },
    'industrial': {
        'DEVICE_ID': 'AIRIS_INDUSTRIAL_001',
        'DEVICE_LOCATION': 'Factory Floor',
        'SAMPLING_INTERVAL': 10,  # Very frequent sampling
        'SENSOR_THRESHOLDS': {
            'co': {
                'max': 50,  # Stricter CO limits
                'alert_level': {
                    'warning': 25,
                    'critical': 40
                }
            },
            'pm25': {
                'max': 250,  # Higher PM2.5 tolerance
                'alert_level': {
                    'warning': 100,
                    'critical': 200
                }
            }
        }
    }
}

# Custom calibration factors for specific sensor units
CUSTOM_CALIBRATION = {
    'mq7_sensor_batch_1': {
        'slope': 100.042,
        'intercept': -1.618,
        'r0': 27.0
    },
    'mq135_sensor_batch_2': {
        'slope': 112.47,
        'intercept': -2.962,
        'r0': 3.5
    }
}

# Logging configurations
LOGGING_CONFIG = {
    'log_level': 'DEBUG',  # More verbose logging
    'log_file': '/var/log/airis/sensor_logs.log',
    'max_log_size_mb': 10,  # Log rotation
    'backup_count': 5  # Number of backup log files
}

# Network retry configurations
NETWORK_CONFIG = {
    'max_connection_attempts': 5,
    'connection_timeout_seconds': 10,
    'retry_delay_seconds': 5
}

# Optional: Environmental context settings
ENVIRONMENT_CONTEXT = {
    'altitude': 500,  # meters above sea level
    'humidity_correction_factor': 1.05,
    'temperature_offset': 0.5  # Calibration offset
}

# Feature flags for experimental or optional features
FEATURE_FLAGS = {
    'enable_advanced_calibration': False,
    'enable_machine_learning_predictions': True,
    'enable_remote_configuration': False
}

# Optional cloud synchronization settings
CLOUD_SYNC_CONFIG = {
    'sync_interval_minutes': 30,
    'max_batch_size': 100,
    'compression_enabled': True
}

# Optional error handling and notification settings
ERROR_HANDLING = {
    'send_email_on_critical_error': True,
    'email_recipients': ['admin@example.com', 'support@example.com'],
    'max_email_frequency_hours': 4
}

# Function to load environment-specific configuration
def load_environment_config(environment='default'):
    """
    Load configuration based on environment context
    
    Args:
        environment (str): Environment identifier
    
    Returns:
        dict: Configuration for specified environment
    """
    return DEVICE_CONFIGURATIONS.get(environment, 
           DEVICE_CONFIGURATIONS.get('default', {}))