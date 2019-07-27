/*
 * Project XenonMeshPub
 * Description:
 * Author:
 * Date:
 */

#include <ArduinoJson.h>
#include "Particle.h"

void setup();
void loop();
int SetPubTopic(String s);
int SetDeviceName(String s);
int PublishLightSensor();
int PublishAngleSensor();
int PublishButton();
void handler(const char *topic, const char *data);
#line 11 "/Users/gallardo/TIBProjects/iot/particle/projects/XenonMeshPub/src/XenonMeshPub.ino"
#define LIGHTPIN A0
#define BUTTONPIN A2
#define ANGLEPIN A4

const unsigned long PUBLISH_INTERVAL_MS = 5000;
unsigned long lastPublish = 0;
char deviceName[64] = "";
char pubTopic[64] = "";
char buffer[255] = ""; 

bool nameReceived = false;      // true: device name received from particle subscribe in handler

// setup() runs once, when the device is first turned on.
void setup() {
  // Put initialization like pinMode and begin functions here.

  // Get device name in handler and save it in deviceName
    Particle.subscribe("particle/device/name", handler);
    Particle.publish("particle/device/name", NULL, 60, PRIVATE);
    
    SetPubTopic("MeshDataTopic");
}

// loop() runs over and over again, as quickly as it can execute.
void loop() {
  // The core of your code will likely live here.

  if (nameReceived) {
        if (millis() - lastPublish >= PUBLISH_INTERVAL_MS) {
	    	lastPublish = millis();
		
		    PublishLightSensor();
		    PublishAngleSensor();
		    PublishButton();
        }
    }
}

int SetPubTopic(String s) {
	s.toCharArray(pubTopic, sizeof(s));
	return 0;
}

int SetDeviceName(String s) {
	s.toCharArray(deviceName, sizeof(s));
	nameReceived = true;
	return 0;
}



int PublishLightSensor() {
    
    int value = analogRead(LIGHTPIN);
    
    StaticJsonDocument<255> jsonDoc;

  
    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "LightSensor";
    jsonDoc["method"] = "get";
    jsonDoc["LightSensor"] = value;
    
    serializeJson(jsonDoc, buffer);
    
    Mesh.publish(pubTopic, buffer);
    
    return 0;
}

int PublishAngleSensor() {
    
    int value = analogRead(ANGLEPIN);
    
    StaticJsonDocument<255> jsonDoc;
  
    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "RotaryAngleSensor";
    jsonDoc["method"] = "get";
    jsonDoc["RotaryAngleSensor"] = value;
    
    serializeJson(jsonDoc, buffer);
    
    Mesh.publish(pubTopic, buffer);
    
    return 0;
}

int PublishButton() {
    
    int ivalue = analogRead(BUTTONPIN);
    bool value = false;
    
    StaticJsonDocument<255> jsonDoc;

    if (ivalue > 0) value = true;
  
    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "Button";
    jsonDoc["method"] = "get";
    jsonDoc["Button"] = value;
    
    serializeJson(jsonDoc, buffer);
    
    Mesh.publish(pubTopic, buffer);
    
    return 0;
}



// -------------------------------------------- Get ClientName
// triggered by the Particle.subscribe and Particle.publish run in setup()
void handler(const char *topic, const char *data) {
    strncpy(deviceName, data, strlen(data));
    
    nameReceived = true;
}