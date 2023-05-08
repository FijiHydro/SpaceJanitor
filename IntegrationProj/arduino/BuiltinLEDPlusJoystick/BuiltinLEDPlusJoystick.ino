
#include <Arduino_JSON.h>

const int joyXPin = A0;
const int joyYPin = A1;
const int switchPin = 2;
const int maxCalibrationFrames = 3;
unsigned long start_time = 0;

float xValue, yValue;
int startX, startY;
float pXValue = -1, pYValue = -1;
float alpha = 0.2;
int calibrationFrames = 0;

JSONVar sensorData;

void setup() {
  Serial.begin(38400);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(switchPin, INPUT);
  digitalWrite(switchPin, HIGH);
  start_time = millis();
}

void loop() { 

  unsigned long currentMillis = millis(); 
  if (currentMillis < 90000) { 
    digitalWrite(LED_BUILTIN, LOW); 
  } 
  else if (currentMillis < 120000) { 
    digitalWrite(LED_BUILTIN, HIGH); 
    delay(100); 
    digitalWrite(LED_BUILTIN, LOW); 
    delay(100); 
  }
  else
    digitalWrite(LED_BUILTIN, LOW);

  xValue = analogRead(joyXPin);
  yValue = analogRead(joyYPin);

  if (pXValue == -1) {
    pXValue = xValue;
    pYValue = yValue;
  }

  xValue = pXValue + alpha*(xValue - pXValue);
  yValue = pYValue + alpha*(yValue - pYValue);
  
  if (calibrationFrames < maxCalibrationFrames) {
    calibrationFrames++;
    startX = xValue;
    startY = yValue;
  }
  else {
    sensorData["x"] = (int) (xValue - startX);
    sensorData["y"] = (int) (yValue - startY);
    sensorData["sw"] = digitalRead(switchPin) == LOW;

    Serial.println(sensorData);
  }

  pXValue = xValue;
  pYValue = yValue;
}
