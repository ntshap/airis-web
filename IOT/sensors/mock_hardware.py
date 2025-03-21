# mock_hardware.py
import random

class Pin:
    IN = 'IN'
    OUT = 'OUT'
    
    def __init__(self, pin_num, mode=None):
        self.pin_num = pin_num
        self.mode = mode
        
    def value(self, val=None):
        if val is not None:
            print(f"Setting pin {self.pin_num} to {val}")
        return val

class ADC:
    ATTN_0DB = 0
    ATTN_2_5DB = 1
    ATTN_6DB = 2
    ATTN_11DB = 3
    
    def __init__(self, pin):
        self.pin = pin
        self._attenuation = self.ATTN_11DB
        
    def atten(self, value):
        self._attenuation = value
        
    def read(self):
        # Simulate different ranges based on attenuation
        if self._attenuation == self.ATTN_11DB:
            return random.randint(1000, 4000)
        return random.randint(0, 4095)