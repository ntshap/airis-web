# gp2y1014au.py
import time
try:
    import machine
    REAL_HARDWARE = True
except ImportError:
    from sensors.mock_hardware import ADC, Pin
    REAL_HARDWARE = False

class GP2Y1014AU:
    def __init__(self, pin):
        if REAL_HARDWARE:
            self.adc = machine.ADC(machine.Pin(pin))
            if hasattr(self.adc, 'atten'):
                self.adc.atten(machine.ADC.ATTN_11DB)
        else:
            self.adc = ADC(pin)
        
        # Set LED pin
        if REAL_HARDWARE:
            self.LED_POWER_PIN = machine.Pin(4, machine.Pin.OUT)
        else:
            self.LED_POWER_PIN = Pin(4, Pin.OUT)
        
        # Constants - exact match with Arduino
        self.VOLTAGE_REF = 3.3  # ESP32 uses 3.3V reference
        self.ADC_RESOLUTION = 4095  # 12-bit ADC

    def read(self):
        try:
            # Exactly match Arduino timing
            self.LED_POWER_PIN.value(0)  # LED on
            time.sleep(0.001)  # Sleep for 1 millisecond
            voMeasured = self.adc.read()  # Raw ADC reading
            time.sleep(0.001)   # Wait 1 millisecond
            self.LED_POWER_PIN.value(1)  # LED off
            time.sleep(0.001) # Wait for remaining cycle
            
            # Debug prints
            print(f"Raw ADC value: {voMeasured}")
            
            # Convert to voltage - match Arduino exactly
            calcVoltage = voMeasured * (self.VOLTAGE_REF / self.ADC_RESOLUTION)
            print(f"Calculated voltage: {calcVoltage:.3f}V")
            
            # Use exact Arduino formula
            dustDensity = 0.17 * calcVoltage - 0.1
            
            # Match Arduino behavior
            if dustDensity < 0:
                dustDensity = 0.0
                
            print(f"Calculated dust density: {dustDensity:.3f} mg/m3")
            
            return round(dustDensity, 2)
            
        except Exception as e:
            print(f"Dust sensor error: {e}")
            return 0.0