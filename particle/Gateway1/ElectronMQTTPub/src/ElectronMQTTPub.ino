// This #include statement was automatically added by the Particle IDE.
#include <ArduinoJson.h>

#include "Particle.h"
#include "MQTT.h"

#define ANGLEPIN A0
#define BUTTONPIN D1
#define LEDPIN D2
#define LIGHTPIN A2

const unsigned long PUBLISH_INTERVAL_MS = 5000;
MQTT* mqtt;
char clientName[64] = "";       
char deviceName[64] = "";       // obtained from particle/device/name
char deviceId[25];              // obrained from system
byte brokerIP[] = {0,0,0,0};    
char pubTopic[256] = "";
char subTopic[256] = ""; 
char responseTopic[256] = "";
char buffer[512] = "";          
char subMessage[512] = "";      // obtained via MQTT subscribe
bool mqttIsInitialized = false; // true: mqtt points to an initialized MQTT instance
bool nameReceived = false;      // true: device name received from particle subscribe in handler
bool mqttIsActive = false;      // true: mqttIsInitialized and mqtt->isConnected are true (maintained in loop())
bool initialized = false;       // true: mqttIsInitialized and nameReceived

unsigned long lastPublish = 0;


void mqttReceiver(char* topic, byte* payload, unsigned int length);

void setup() {
    //Serial.begin(9600);

    // Get Device Id
    System.deviceID().toCharArray(deviceId, sizeof(deviceId));
    
    // Get device name in handler and save it in deviceName
    Particle.subscribe("particle/device/name", handler);
    Particle.publish("particle/device/name", NULL, 60, PRIVATE);
    
    
    SetClientName("ParticleDevice");
    
    
    ConnectToMQTT("137.117.38.255");
    
    pinMode(BUTTONPIN, INPUT);
    pinMode(ANGLEPIN, INPUT);
    
    SetPubTopic("DataTopic");
    SetResponseTopic("ResponseTopic");
    
}


void loop() {
    
    if (initialized) {
        if (millis() - lastPublish >= PUBLISH_INTERVAL_MS) {
		    lastPublish = millis();
            
            if (mqtt->isConnected()) {
                mqttIsActive = true;
            
                //PublishLightSensor();
                PublishAngleSensor();
                PublishButton();
            
                mqtt->loop();
            } else {
                mqttIsActive = false;
            }
        }
    }
    else {
        if (nameReceived && mqttIsInitialized && mqtt->isConnected()) {
            // Subscribe to mqtt command topic
            MQTTSubscribe();
            
            initialized = true;
            
        }
    }
}

// --------------------------------------------- Connect to the MQTT Broker via IP address
// triggered by Particle.function
int ConnectToMQTT(String s) {
    
    s.toCharArray(buffer, sizeof(s));

	// connect via IP Address ---------------------------
    for (int i = 0; i < 4; i++) brokerIP[i] = 0;
    sscanf( buffer, "%u.%u.%u.%u", &brokerIP[0], &brokerIP[1], &brokerIP[2], &brokerIP[3] );
    //Serial.printf("brokerIP: %u.%u.%u.%u\r\n", brokerIP[0], brokerIP[1], brokerIP[2], brokerIP[3] );
	mqtt = new MQTT(brokerIP, 1883, 15, mqttReceiver);
	
    
    mqtt->connect(clientName);
    
    mqttIsInitialized = true;
    
    return 0;
}

int SetClientName(String s) {
    
    s.toCharArray(buffer, sizeof(s));
    strncpy(clientName, buffer, sizeof(clientName));
        
    return 0;
}

int SetPubTopic(String s) {
	s.toCharArray(pubTopic, sizeof(s));
	return 0;
}

int SetResponseTopic(String s) {
	s.toCharArray(responseTopic, sizeof(s));
	return 0;
}

int PublishLightSensor() {
    
    //int value = analogRead(LIGHTPIN);
    
    StaticJsonDocument<256> jsonDoc;
  
    jsonDoc["deviceId"] = deviceId;
    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "LightSensor";
    jsonDoc["method"] = "get";
    //jsonDoc["LightSensor"] = value;
    jsonDoc["LightSensor"] = 100;
    
    serializeJson(jsonDoc, buffer);
    
    mqtt->publish(pubTopic, buffer);
    
    return 0;
}

int PublishAngleSensor() {
    
    int value = analogRead(ANGLEPIN);
    
    StaticJsonDocument<256> jsonDoc;
  
    jsonDoc["deviceId"] = deviceId;
    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "RotaryAngleSensor";
    jsonDoc["method"] = "get";
    jsonDoc["RotaryAngleSensor"] = value;
    
    serializeJson(jsonDoc, buffer);
    
    mqtt->publish(pubTopic, buffer);
    
    return 0;
}

int PublishButton() {
    
    int ivalue = digitalRead(BUTTONPIN);
    bool value = false;
    
    StaticJsonDocument<256> jsonDoc;

    if (ivalue > 0) value = true;
  
    jsonDoc["deviceId"] = deviceId;
    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "Button";
    jsonDoc["method"] = "get";
    jsonDoc["Button"] = value;
    
    serializeJson(jsonDoc, buffer);
    
    mqtt->publish(pubTopic, buffer);
    
    return 0;
}


int PublishResponse() {
    
    int value = 99;
    bool bvalue = false;
    
    StaticJsonDocument<512> jd;
    DeserializationError error = deserializeJson(jd, subMessage);
    
    StaticJsonDocument<256> jsonDoc;
    
    if (!error) {
        // parseObject() succeeded
        const char* uuid = jd["uuid"];
        const char* cmd = jd["cmd"];
        const char* method = jd["method"];
        
        if (strcmp(method, "set") == 0) {
            if (strcmp(cmd, "Led") == 0) { 
                bool value = jd["Led"];
                
                if (value) {
                    digitalWrite(LEDPIN, HIGH);
                }
                else {
                    digitalWrite(LEDPIN, LOW);
                }
                
                jsonDoc[cmd] = value;
            }
            
            // Response to avoid error for put cmd
            // parseObject() failed
            jsonDoc["name"] = deviceName;
            jsonDoc["cmd"] = cmd;
            jsonDoc["method"] = method;
            jsonDoc["uuid"] = uuid;
            
    
            serializeJson(jsonDoc, buffer);
        
            mqtt->publish(responseTopic, buffer);
        }
        else {
            
            if (strcmp(cmd, "LightSensor") == 0) { 
                value = analogRead(LIGHTPIN);
                jsonDoc["cmd"] = "LightSensor";
                jsonDoc["LightSensor"] = value;
            }
            else if (strcmp(cmd, "RotaryAngleSensor") == 0) { 
                value = analogRead(ANGLEPIN);
                jsonDoc["cmd"] = "RotaryAngleSensor";
                jsonDoc["RotaryAngleSensor"] = value;
            }
            else if (strcmp(cmd, "Button") == 0) { 
                value = analogRead(BUTTONPIN);
            
                if (value > 0) bvalue = true;
            
                jsonDoc["cmd"] = "Button";
                jsonDoc["Button"] = bvalue;
            
            }
        
            jsonDoc["name"] = deviceName;
            jsonDoc["method"] = "get";
            jsonDoc["uuid"] = uuid;
    
            serializeJson(jsonDoc, buffer);
            
            mqtt->publish(responseTopic, buffer);
        }
        
    } else {
        // parseObject() failed
        jsonDoc["name"] = deviceName;
        jsonDoc["cmd"] = "LightSensor";
        jsonDoc["method"] = "get";
        jsonDoc["LightSensor"] = value;
    
        serializeJson(jsonDoc, buffer);
        
        mqtt->publish(responseTopic, buffer);
    }
    
    return 0;
}


// --------------------------------------------- Subscribe to a Topic
// 
int MQTTSubscribe() {
    
    strcpy(subTopic, "CommandTopic_");
    strcat(subTopic, deviceName);

    if (mqtt->isConnected()) {

	    mqtt->subscribe(subTopic);
	    
    	return 0;
	} else return 1;
}

// --------------------------------------------- Receive an MQTT Message
// triggered when a message is received from the MQTT Broker
void mqttReceiver(char* topic, byte* payload, unsigned int length) {
    //strncpy(subTopic, topic, sizeof(subTopic));
	memcpy(subMessage, payload, length);
	subMessage[length] = '\0';
	
	PublishResponse();
}

// -------------------------------------------- Get ClientName
// triggered by the Particle.subscribe and Particle.publish run in setup()
void handler(const char *topic, const char *data) {
    strncpy(deviceName, data, strlen(data));
    
    nameReceived = true;
}
