# mq135.py
import math
import logging

try:
    import machine
    REAL_HARDWARE = True
except ImportError:
    from sensors.mock_hardware import ADC, Pin
    REAL_HARDWARE = False

class MQ135:
    def __init__(self, pin, params):
        if REAL_HARDWARE:
            self.adc = machine.ADC(machine.Pin(pin))
            if hasattr(self.adc, 'atten'):
                self.adc.atten(machine.ADC.ATTN_11DB)
        else:
            self.adc = ADC(pin)
        
        # Exact same parameters as Arduino
        self.VOLTAGE_RESOLUTION = params['VOLTAGE_RESOLUTION']
        self.ADC_BIT_RESOLUTION = params['ADC_BIT_RESOLUTION']
        self.RATIO_CLEAN_AIR = params['RATIO_CLEAN_AIR']
        self.A = params['A']
        self.B = params['B']
        
    def update(self):
        pass

    def read_sensor(self):
        try:
            raw_adc = self.adc.read()
            voltage = raw_adc * (self.VOLTAGE_RESOLUTION / ((1 << self.ADC_BIT_RESOLUTION) - 1))
            rs_ro_ratio = ((self.VOLTAGE_RESOLUTION / voltage) - 1)
            
            # Use exact same formula as Arduino MQUnifiedsensor
            ppm = self.A * pow(rs_ro_ratio / self.RATIO_CLEAN_AIR, self.B)
            co2_value = ppm + 400
            return co2_value
        except Exception as e:
            logging.error(f"MQ135 read error: {e}")
            return 0