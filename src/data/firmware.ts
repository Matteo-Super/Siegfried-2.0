// Full control firmware for the Siegfried 2.0 Arduino kit.
// Open source — copy, upload, drive.
export const ARDUINO_FIRMWARE = `//RGB
#include "Freenove_WS2812B_RGBLED_Controller.h"
#include "Servo.h"

byte fadeValue = 0;  // 0 = Komplett Grün, 255 = Komplett Rot
byte rainbowStep = 0;

// LED
#define I2C_ADDRESS 0x20
#define LEDS_ANZ 10
Freenove_WS2812B_Controller strip(I2C_ADDRESS, LEDS_ANZ, TYPE_GRB);

// Motoren
#define PIN_DIRECTION_RIGHT 3
#define PIN_DIRECTION_LEFT 4
#define PIN_MOTOR_PWM_RIGHT 5
#define PIN_MOTOR_PWM_LEFT 6
#define PIN_BUZZER A0

// Infrarot
#define PIN_TRACKING_LEFT A1
#define PIN_TRACKING_CENTER A2
#define PIN_TRACKING_RIGHT A3

#define speedT1 100
#define speedT2 140
#define speedT_1 -100
#define speedT_2 -140
#define speedF 80

// Servo
#define PIN_SERVO 2
Servo servo;
byte servoOffset = 12;

// Ultrasonic
#define PIN_SONIC_TRIG 7
#define PIN_SONIC_ECHO 8
#define MAX_DISTANCE 220  // In cm
#define SONIC_TIMEOUT (MAX_DISTANCE * 60)
#define SOUND_VELOCITY 0.034  // cm pro Mikrosekunde

bool isStopped = true;
unsigned long freePathStartTime = 0;
int stuckCounter = 0;

// Funktionen
float getSonar() {
  unsigned long pingTime;
  float distance;
  digitalWrite(PIN_SONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_SONIC_TRIG, LOW);

  pingTime = pulseIn(PIN_SONIC_ECHO, HIGH, SONIC_TIMEOUT);

  if (pingTime != 0) {
    distance = (float)pingTime * SOUND_VELOCITY / 2;
  } else {
    distance = MAX_DISTANCE;
  }
  return distance;
}

void motorRun(int speedL, int speedR) {
  int dirL = 0, dirR = 0;
  if (speedL > 0) {
    dirL = 1;
  } else {
    dirL = 0;
    speedL = abs(speedL);
  }
  if (speedR > 0) {
    dirR = 0;
  } else {
    dirR = 1;
    speedR = abs(speedR);
  }

  digitalWrite(PIN_DIRECTION_RIGHT, dirR);
  digitalWrite(PIN_DIRECTION_LEFT, dirL);
  analogWrite(PIN_MOTOR_PWM_RIGHT, speedR);
  analogWrite(PIN_MOTOR_PWM_LEFT, speedL);
}

byte RIGHT = 1;
byte LEFT = 0;

void drehen(int Grad, int direction = RIGHT) {
  if (direction == RIGHT) {
    motorRun(140, -140);
    delay(4.9 * Grad);
    motorRun(0, 0);
  } else if (direction == LEFT) {
    motorRun(-180, 180);
    delay(4.9 * Grad);
    motorRun(0, 0);
  }
}

void befreien() {
  Serial.println("BIN FESTGEFAHREN! Befreiungs-Modus aktiviert...");
  for (int i = 0; i < 150; i += 20) {
    strip.setAllLedsColor(255, i, 0);
    digitalWrite(PIN_BUZZER, HIGH);
  }
  digitalWrite(PIN_BUZZER, HIGH);
  motorRun(-180, -180);
  delay(300);
  for (int i = 0; i < 4; i++) {
    motorRun(200, -200);
    delay(200);
    motorRun(-200, 200);
    delay(200);
  }
  digitalWrite(PIN_BUZZER, LOW);
  drehen(220);
  motorRun(0, 0);
  stuckCounter = 0;
}

void setup() {
  Serial.begin(9600);
  servo.attach(PIN_SERVO);
  servo.write(90 + servoOffset);

  pinMode(PIN_SONIC_TRIG, OUTPUT);
  pinMode(PIN_SONIC_ECHO, INPUT);
  pinMode(PIN_DIRECTION_RIGHT, OUTPUT);
  pinMode(PIN_DIRECTION_LEFT, OUTPUT);
  pinMode(PIN_MOTOR_PWM_RIGHT, OUTPUT);
  pinMode(PIN_MOTOR_PWM_LEFT, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_TRACKING_LEFT, INPUT);
  pinMode(PIN_TRACKING_RIGHT, INPUT);
  pinMode(PIN_TRACKING_CENTER, INPUT);

  while (!strip.begin());

  for (int i = 0; i <= 255; i += 5) {
    strip.setAllLedsColor(0, i, 0);
    delay(2);
  }
}

byte sensorValue[4];

byte getSensorVal() {
  sensorValue[0] = digitalRead(PIN_TRACKING_LEFT);
  sensorValue[1] = digitalRead(PIN_TRACKING_CENTER);
  sensorValue[2] = digitalRead(PIN_TRACKING_RIGHT);
  sensorValue[3] = sensorValue[0] << 2 | sensorValue[1] << 1 | sensorValue[2];
  return sensorValue[3];
}

byte trackingSensorVal;
bool Auto = false;
unsigned long timeTracking0;

void trackingLine() {
  switch (trackingSensorVal) {
    case 0:
      if (millis() - timeTracking0 > 1200) Auto = true;
      isStopped = true;
      break;
    case 7:
      motorRun(speedF, speedF);
      strip.setAllLedsColor(0, 255, 0);
      break;
    case 1:
      motorRun(speedT2, speedT_2);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
    case 2:
      motorRun(speedF, speedF);
      strip.setAllLedsColor(0, 255, 0);
      timeTracking0 = millis();
      break;
    case 3:
      motorRun(speedT1, speedT_1);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
    case 4:
      motorRun(speedT_2, speedT2);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
    case 5:
      motorRun(speedT_2, speedT2);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
    case 6:
      motorRun(speedT_1, speedT1);
      strip.setAllLedsColor(255, 122, 0);
      timeTracking0 = millis();
      break;
  }
}

void automaticAvoidance() {
  float distance[5];
  distance[0] = getSonar();

  if (distance[0] > 0 && distance[0] <= 30) {
    if (!isStopped) {
      stuckCounter++;
      freePathStartTime = millis();
    }
    if (stuckCounter >= 4) befreien();

    motorRun(-120, -120);
    delay(200);
    motorRun(0, 0);

    for (int i = fadeValue; i <= 255; i += 25) {
      strip.setAllLedsColor(i, 255 - i, 0);
      delay(10);
    }
    fadeValue = 255;
    isStopped = true;

    for (int i = 40; i <= 140; i += 25) {
      servo.write(i + servoOffset);
      delay(200);
      int index = (i - 40) / 25;
      distance[index] = getSonar();
    }
    delay(200);
    servo.write(90 + servoOffset);

    float maxDist = distance[0];
    int bestIndex = 0;

    for (int i = 1; i < 5; i++) {
      if (distance[i] > maxDist) {
        maxDist = distance[i];
        bestIndex = i;
      }
    }

    if (maxDist <= 40) {
      drehen(180);
    } else {
      switch (bestIndex) {
        case 0: drehen(85, RIGHT); break;
        case 1: drehen(30, RIGHT); break;
        case 2: drehen(30, RIGHT); break;
        case 3: drehen(30, LEFT); break;
        case 4: drehen(85, LEFT); break;
      }
    }

    for (int i = fadeValue; i >= 0; i -= 25) {
      strip.setAllLedsColor(i, 255 - i, 0);
      delay(10);
    }
    fadeValue = 0;
  } else {
    if (!isStopped && (millis() - freePathStartTime > 200)) {
      stuckCounter = 0;
    }
    if (isStopped) {
      motorRun(200, 200);
      isStopped = false;
      freePathStartTime = millis();
      rainbowStep = 0;
    }
    if (millis() - freePathStartTime >= 2000) {
      for (int i = 0; i < LEDS_ANZ; i++) {
        strip.setLedColor(i, strip.Wheel(((i * 256 / LEDS_ANZ) + rainbowStep) & 255));
      }
      rainbowStep += 3;
      if (rainbowStep >= 255) rainbowStep = 0;
      delay(5);
    } else {
      if (fadeValue > 0) fadeValue -= 15;
      if (fadeValue < 0) fadeValue = 0;
      strip.setAllLedsColor(fadeValue, 255 - fadeValue, 0);
    }
  }
}

void loop() {
  trackingSensorVal = getSensorVal();
  if (trackingSensorVal != 0) {
    Auto = false;
    timeTracking0 = millis();
  } else if (millis() - timeTracking0 > 1200) {
    Auto = true;
  }
  if (Auto == false) {
    strip.setAllLedsColor(0, 255, 0);
    trackingLine();
  } else {
    automaticAvoidance();
  }
}`;
