/******************************************************/
//       THIS IS A GENERATED FILE - DO NOT EDIT       //
/******************************************************/

#line 1 "/Users/gallardo/workspace/go/src/github.com/TIBCOSoftware/labs-air/particle/Gateway1/PhotonMQTTPub/src/PhotonMQTTPub.ino"
/*
 * Project PhotonMQTTPub
 * Description:
 * Author:
 * Date:
 */

#include <ArduinoJson.h>

#include "Particle.h"
#include "MQTT.h"

void setup();
void loop();
int ConnectToMQTT(String s);
int SetClientName(String s);
int SetPubTopic(String s);
int SetResponseTopic(String s);
int PublishLightSensor();
int PublishAngleSensor();
int PublishButton();
int PublishResponse();
int MQTTSubscribe();
void handler(const char *topic, const char *data);
#line 13 "/Users/gallardo/workspace/go/src/github.com/TIBCOSoftware/labs-air/particle/Gateway1/PhotonMQTTPub/src/PhotonMQTTPub.ino"
#define LIGHTPIN A0
#define BUTTONPIN D6
#define ANGLEPIN A4


const unsigned long PUBLISH_INTERVAL_MS = 5000;

char mqttuser[] = "mqtt_admin";
char mqttpass[] = "mqtt_admin";
char clientName[64] = "";
char deviceName[64] = "";       // obtained from particle/device/name
byte brokerIP[] = {192,168,1,92};
char pubTopic[256] = "";
char subTopic[256] = "";
char responseTopic[256] = "";
char buffer[512] = "";
char subMessage[512] = "";      // obtained via MQTT subscribe
bool mqttIsInitialized = false; // true: mqtt points to an initialized MQTT instance
bool nameReceived = false;      // true: device name received from particle subscribe in handler
bool mqttIsActive = false;      // true: mqttIsInitialized and mqttClient.isConnected are true (maintained in loop())
bool initialized = false;       // true: mqttIsInitialized and nameReceived

unsigned long lastPublish = 0;

void mqttReceiver(char *topic, byte *payload, unsigned int length);
MQTT mqttClient(brokerIP, 1883, mqttReceiver);

// setup() runs once, when the device is first turned on.
void setup()
{
    Serial.begin(9600);

    // Put initialization like pinMode and begin functions here.

    // Get device name in handler and save it in deviceName
    Particle.subscribe("particle/device/name", handler);
    Particle.publish("particle/device/name", NULL, 60, PRIVATE);

    SetClientName("PhotonParticleDevice");

    ConnectToMQTT("192.168.1.92");

    pinMode(LIGHTPIN, INPUT);
    pinMode(BUTTONPIN, INPUT_PULLDOWN);
    pinMode(ANGLEPIN, INPUT);

    SetPubTopic("PhotonDataTopic");
    SetResponseTopic("PhotonResponseTopic");
}

// loop() runs over and over again, as quickly as it can execute.
void loop(){
    // The core of your code will likely live here.
    
    if (initialized)
    {
        if (millis() - lastPublish >= PUBLISH_INTERVAL_MS)
        {
            lastPublish = millis();

            if (mqttClient.isConnected())
            {
                Serial.printlnf("MQTT connected");
                mqttIsActive = true;

                PublishLightSensor();
                PublishAngleSensor();
                PublishButton();

                mqttClient.loop();
            }
            else
            {
                mqttIsActive = false;
            }
        }
    }
    else
    {
        if (nameReceived && mqttIsInitialized && mqttClient.isConnected())
        {
            // Subscribe to mqtt command topic
            MQTTSubscribe();

            initialized = true;
        }
    }
}

// --------------------------------------------- Connect to the MQTT Broker via IP address
// triggered by Particle.function
int ConnectToMQTT(String s)
{

    mqttClient.connect(clientName, mqttuser, mqttpass);

    mqttIsInitialized = true;

    Serial.printlnf("Called MQTT connect");

    if (mqttClient.isConnected()) {
          Serial.printlnf("MQTT is connected");
    }

    return 0;
}

int SetClientName(String s)
{

    s.toCharArray(buffer, sizeof(s));
    strncpy(clientName, buffer, sizeof(clientName));

    return 0;
}

int SetPubTopic(String s)
{
    s.toCharArray(pubTopic, sizeof(s));
    return 0;
}

int SetResponseTopic(String s)
{
    s.toCharArray(responseTopic, sizeof(s));
    return 0;
}

int PublishLightSensor()
{

    int value = analogRead(LIGHTPIN);

    StaticJsonDocument<256> jsonDoc;

    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "LightSensor";
    jsonDoc["method"] = "get";
    jsonDoc["LightSensor"] = value;

    serializeJson(jsonDoc, buffer);

    mqttClient.publish(pubTopic, buffer);

    return 0;
}

int PublishAngleSensor()
{

    int value = analogRead(ANGLEPIN);

    StaticJsonDocument<256> jsonDoc;

    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "RotaryAngleSensor";
    jsonDoc["method"] = "get";
    jsonDoc["RotaryAngleSensor"] = value;

    serializeJson(jsonDoc, buffer);

    mqttClient.publish(pubTopic, buffer);

    return 0;
}

int PublishButton()
{

    int ivalue = digitalRead(BUTTONPIN);
    bool value = false;

    StaticJsonDocument<256> jsonDoc;

    if (ivalue > 0)
        value = true;

    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "Button";
    jsonDoc["method"] = "get";
    jsonDoc["Button"] = value;

    serializeJson(jsonDoc, buffer);

    mqttClient.publish(pubTopic, buffer);

    return 0;
}


int PublishResponse()
{

    int value = 99;
    bool bvalue = false;

    StaticJsonDocument<512> jd;
    DeserializationError error = deserializeJson(jd, subMessage);

    StaticJsonDocument<256> jsonDoc;

    if (!error)
    {
        // parseObject() succeeded
        const char *uuid = jd["uuid"];
        const char *cmd = jd["cmd"];
        const char *method = jd["method"];

        if (strcmp(method, "get") == 0)
        {

            if (strcmp(cmd, "LightSensor") == 0)
            {
                value = analogRead(LIGHTPIN);
                jsonDoc["cmd"] = "LightSensor";
                jsonDoc["LightSensor"] = value;
            }
            else if (strcmp(cmd, "RotaryAngleSensor") == 0)
            {
                value = analogRead(ANGLEPIN);
                jsonDoc["cmd"] = "RotaryAngleSensor";
                jsonDoc["RotaryAngleSensor"] = value;
            }
            else if (strcmp(cmd, "Button") == 0)
            {
                value = digitalRead(BUTTONPIN);

                if (value > 0)
                    bvalue = true;

                jsonDoc["cmd"] = "Button";
                jsonDoc["Button"] = bvalue;
            }

            jsonDoc["name"] = deviceName;
            jsonDoc["method"] = "get";
            jsonDoc["uuid"] = uuid;

            serializeJson(jsonDoc, buffer);

            mqttClient.publish(responseTopic, buffer);
        }
    }
    else
    {
        // parseObject() failed
        jsonDoc["name"] = deviceName;
        jsonDoc["cmd"] = "LightSensor";
        jsonDoc["method"] = "get";
        jsonDoc["LightSensor"] = value;

        serializeJson(jsonDoc, buffer);

        mqttClient.publish(responseTopic, buffer);
    }

    return 0;
}

// --------------------------------------------- Subscribe to a Topic
//
int MQTTSubscribe()
{

    strcpy(subTopic, "CommandTopic_");
    strcat(subTopic, deviceName);

    if (mqttClient.isConnected())
    {

        mqttClient.subscribe(subTopic);

        return 0;
    }
    else
        return 1;
}

// --------------------------------------------- Receive an MQTT Message
// triggered when a message is received from the MQTT Broker
void mqttReceiver(char *topic, byte *payload, unsigned int length)
{
    //strncpy(subTopic, topic, sizeof(subTopic));
    memcpy(subMessage, payload, length);
    subMessage[length] = '\0';

    PublishResponse();
}

// -------------------------------------------- Get ClientName
// triggered by the Particle.subscribe and Particle.publish run in setup()
void handler(const char *topic, const char *data)
{
      Serial.printlnf("Name Received");
    strncpy(deviceName, data, strlen(data));

    nameReceived = true;
}
