# mq7.py
try:
    import machine
    REAL_HARDWARE = True
except ImportError:
    from sensors.mock_hardware import ADC, Pin
    REAL_HARDWARE = False

class MQ7:
    def __init__(self, pin, params):
        if REAL_HARDWARE:
            self.adc = machine.ADC(machine.Pin(pin))
            if hasattr(self.adc, 'atten'):
                self.adc.atten(machine.ADC.ATTN_11DB)
        else:
            self.adc = ADC(pin)
        
        # Exact Arduino parameters
        self.R0 = None
        self.calibrate()
        self.VOLT_RESOLUTION = params['VOLTAGE_RESOLUTION']
        self.ADC_RESOLUTION = (1 << params['ADC_BIT_RESOLUTION']) - 1  # 12-bit ADC
        self.A = params['A']
        self.B = params['B']
        self.RATIO_CLEAN_AIR = params['RATIO_CLEAN_AIR']

        # Debugging: Log initialization parameters
        logger.debug(f"MQ7 initialized with pin: {pin}, params: {params}")

    def calibrate(self):
        # Implementasi kalibrasi R0 seperti di Arduino
        calcR0 = 0
        for _ in range(10):
            raw_adc = self.adc.read()
            voltage = raw_adc * (self.VOLT_RESOLUTION / self.ADC_RESOLUTION)
            rs = (self.VOLT_RESOLUTION - voltage) / voltage
            calcR0 += rs / self.RATIO_CLEAN_AIR  # Sesuaikan dengan parameter clean air
        self.R0 = calcR0 / 10

        # Debugging: Log calibration result
        logger.debug(f"MQ7 calibration complete, R0: {self.R0}")

    def read_sensor(self):
        try:
            # Debug raw values
            raw_adc = self.adc.read()
            logger.debug(f"MQ7 Raw ADC: {raw_adc}")
            
            # Match Arduino exactly
            voltage = raw_adc * (self.VOLT_RESOLUTION / self.ADC_RESOLUTION)
            logger.debug(f"MQ7 Voltage: {voltage:.3f}V")

            rs = (self.VOLT_RESOLUTION - voltage) / voltage
            ratio = rs / self.R0
            
            # Direct match with Arduino code
            co_ppm = self.A * pow(ratio, self.B)
            logger.debug(f"MQ7 CO PPM: {co_ppm:.2f}")
            
            return co_ppm
            
        except Exception as e:
            logger.error(f"MQ7 error: {e}")
            return 0