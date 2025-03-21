#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <MQUnifiedsensor.h>

// MQ-7 Sensor Configuration (5V)
#define PLACA "ESP-32"
#define MQ7_VOLTAGE_RESOLUTION 5  // MQ-7 uses 5V
#define MQ7_PIN 32                  // Analog pin for MQ-7
#define MQ7_TYPE "MQ-7"             // Type of sensor
#define MQ7_ADC_BIT_RESOLUTION 12   // ADC resolution
#define MQ7_RATIO_CLEAN_AIR 27.5    // RS / R0 = 27.5 ppm
#define PWMPIN 5                    // Pin connected to MOSFET

// MQ-135 Sensor Configuration (5V)
#define MQ135_VOLTAGE_RESOLUTION 5 // MQ-135 uses 5V
#define MQ135_PIN 35                 // Analog pin for MQ-135
#define MQ135_TYPE "MQ-135"          // Type of sensor
#define MQ135_ADC_BIT_RESOLUTION 12   // ADC resolution
#define MQ135_RATIO_CLEAN_AIR 3.6    // RS / R0 = 3.6 ppm

// Dust Sensor Configuration (3.3V)
#define DUST_MEASURE_PIN 34          // Analog pin for dust sensor
#define LED_POWER_PIN 4              // Digital pin for LED control

// Declare Sensors
MQUnifiedsensor MQ7(PLACA, MQ7_VOLTAGE_RESOLUTION, MQ7_ADC_BIT_RESOLUTION, MQ7_PIN, MQ7_TYPE);
MQUnifiedsensor MQ135(PLACA, MQ135_VOLTAGE_RESOLUTION, MQ135_ADC_BIT_RESOLUTION, MQ135_PIN, MQ135_TYPE);

// Declare LCD
LiquidCrystal_I2C lcd(0x27, 16, 4); // Address 0x27, 16 column and 4 rows

// Global variables to store sensor readings
float coConcentration = 0.0;
float co2Concentration = 0.0;
float dustDensity = 0.0;

void setup() {
  Serial.begin(9600); // Initialize serial communication
  pinMode(PWMPIN, OUTPUT);
  pinMode(LED_POWER_PIN, OUTPUT);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Initializing...");

  // Initialize MQ-7 Sensor
  MQ7.setRegressionMethod(1); // Set math model to calculate the PPM concentration
  MQ7.setA(99.042); 
  MQ7.setB(-1.518); // Configure the equation to calculate CO concentration value
  MQ7.init(); 

  // Calibrate MQ-7
  float calcR0 = 0;
  for (int i = 1; i <= 10; i++) {
    MQ7.update(); // Update data
    calcR0 += MQ7.calibrate(MQ7_RATIO_CLEAN_AIR);
  }
  MQ7.setR0(calcR0 / 10);

  if (isinf(calcR0)) {
    Serial.println("Warning: Connection issue, R0 is infinite (Open circuit detected) please check your wiring and supply");
    while (1);
  }
  if (calcR0 == 0) {
    Serial.println("Warning: Connection issue found, R0 is zero (Analog pin shorts to ground) please check your wiring and supply");
    while (1);
  }

  // Initialize MQ-135 Sensor
  MQ135.setRegressionMethod(1); // Set math model to calculate the PPM concentration
  MQ135.init(); 
}

void loop() {
  // Read sensor values
  readCOConcentration();
  readCO2Concentration();
  readDustDensity();

  // Print all sensor readings to Serial
  Serial.print("CO Concentration: ");
  Serial.print(coConcentration);
  Serial.println(" ppm");

  Serial.print("CO2 Concentration: ");
  Serial.print(co2Concentration);
  Serial.println(" PPM");

  Serial.print("Dust Density: ");
  Serial.print(dustDensity);
  Serial.println(" mg/m3");

  // Display sensor readings on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("CO: ");
  lcd.print(coConcentration);
  lcd.print(" ppm");

  lcd.setCursor(0, 1);
  lcd.print("CO2: ");
  lcd.print(co2Concentration);
  lcd.print(" PPM");

  lcd.setCursor(0, 2);
  lcd.print("Dust: ");
  lcd.print(dustDensity);
  lcd.print("mg/m3");

  delay(1000); // Delay between readings
}

void readCOConcentration() {
  analogWrite(PWMPIN, 255); // 5V output
  MQ7.update(); // Update data
  MQ7.readSensor(); // Read sensor data
  coConcentration = MQ7.readSensor(); // Use the correct method to get PPM
}

void readCO2Concentration() {
  MQ135.update(); 
  MQ135.setA(110.47); 
  MQ135.setB(-2.862); 
  float CO2 = MQ135.readSensor();
  co2Concentration = CO2 + 400; // Adjust based on calibration
}

void readDustDensity() {
  digitalWrite(LED_POWER_PIN, LOW);
  delayMicroseconds(280);
  float voMeasured = analogRead(DUST_MEASURE_PIN);
  delayMicroseconds(40);
  digitalWrite(LED_POWER_PIN, HIGH);
  delayMicroseconds(9860);
  float calcVoltage = voMeasured * (3.3 / 4095.0); // ESP32 uses 12-bit ADC with 3.3V reference
  dustDensity = 170 * calcVoltage - 0.1;
}