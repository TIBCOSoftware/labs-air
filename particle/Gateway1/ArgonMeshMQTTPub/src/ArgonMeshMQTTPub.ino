/*
 * Project MeshArgonMQTTPub
 * Description:
 * Author:
 * Date:
 */

#include <ArduinoJson.h>

#include "Particle.h"
#include "MQTT.h"

#define LIGHTPIN A0
#define BUTTONPIN A2
#define ANGLEPIN A4
#define LEDPIN D2

const unsigned long PUBLISH_INTERVAL_MS = 5000;
MQTT *mqtt;
char mqttuser[] = "mqtt_admin";
char mqttpass[] = "mqtt_admin";
char clientName[64] = "";
char deviceName[64] = "";       // obtained from particle/device/name
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

void mqttReceiver(char *topic, byte *payload, unsigned int length);
void meshReceiver(const char *event, const char *data);

// setup() runs once, when the device is first turned on.
void setup()
{
    // Serial.begin(9600);

    // Put initialization like pinMode and begin functions here.

    // Get device name in handler and save it in deviceName
    Particle.subscribe("particle/device/name", handler);
    Particle.publish("particle/device/name", NULL, 60, PRIVATE);

    SetClientName("ParticleDevice");

    ConnectToMQTT("192.168.1.92");
    // ConnectToMQTT("52.45.185.99");

    pinMode(LIGHTPIN, INPUT);
    pinMode(BUTTONPIN, INPUT_PULLDOWN);
    pinMode(ANGLEPIN, INPUT);
    pinMode(LEDPIN, OUTPUT);
    digitalWrite(LEDPIN, LOW);

    SetPubTopic("DataTopic");
    SetResponseTopic("ResponseTopic");
}

// loop() runs over and over again, as quickly as it can execute.
void loop(){
    // The core of your code will likely live here.

    if (initialized)
    {
        if (millis() - lastPublish >= PUBLISH_INTERVAL_MS)
        {
            lastPublish = millis();

            if (mqtt->isConnected())
            {
                mqttIsActive = true;

                PublishLightSensor();
                PublishAngleSensor();
                PublishButton();
                PublishLed();

                mqtt->loop();
            }
            else
            {
                mqttIsActive = false;
            }
        }
    }
    else
    {
        if (nameReceived && mqttIsInitialized && mqtt->isConnected())
        {
            // Subscribe to mqtt command topic
            MQTTSubscribe();

            // Subscribe to mess topic
            Mesh.subscribe("MeshDataTopic", meshReceiver);

            initialized = true;
        }
    }
}

// --------------------------------------------- Connect to the MQTT Broker via IP address
// triggered by Particle.function
int ConnectToMQTT(String s)
{

    s.toCharArray(buffer, sizeof(s));

    // connect via IP Address ---------------------------
    for (int i = 0; i < 4; i++)
        brokerIP[i] = 0;
    sscanf(buffer, "%u.%u.%u.%u", &brokerIP[0], &brokerIP[1], &brokerIP[2], &brokerIP[3]);
    // Serial.printf("brokerIP: %u.%u.%u.%u\r\n", brokerIP[0], brokerIP[1], brokerIP[2], brokerIP[3] );
    mqtt = new MQTT(brokerIP, 1883, 15, mqttReceiver);

    mqtt->connect(clientName, mqttuser, mqttpass);

    mqttIsInitialized = true;

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

    mqtt->publish(pubTopic, buffer);

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

    mqtt->publish(pubTopic, buffer);

    return 0;
}

int PublishButton()
{

    int ivalue = analogRead(BUTTONPIN);
    bool value = false;

    StaticJsonDocument<256> jsonDoc;

    if (ivalue > 0)
        value = true;

    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "Button";
    jsonDoc["method"] = "get";
    jsonDoc["Button"] = value;

    serializeJson(jsonDoc, buffer);

    mqtt->publish(pubTopic, buffer);

    return 0;
}

int PublishLed()
{

    int ivalue = digitalRead(LEDPIN);
    bool value = false;

    StaticJsonDocument<256> jsonDoc;

    if (ivalue == HIGH)
        value = true;

    jsonDoc["name"] = deviceName;
    jsonDoc["cmd"] = "Led";
    jsonDoc["method"] = "get";
    jsonDoc["Button"] = value;

    serializeJson(jsonDoc, buffer);

    mqtt->publish(pubTopic, buffer);

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

        if (strcmp(method, "set") == 0)
        {
            if (strcmp(cmd, "Led") == 0)
            {
                bool value = jd["Led"];

                if (value)
                {
                    digitalWrite(LEDPIN, HIGH);
                }
                else
                {
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
        else
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
                value = analogRead(BUTTONPIN);

                if (value > 0)
                    bvalue = true;

                jsonDoc["cmd"] = "Button";
                jsonDoc["Button"] = bvalue;
            }
            else if (strcmp(cmd, "Led") == 0)
            {
                value = digitalRead(LEDPIN);

                if (value == HIGH)
                    bvalue = true;

                jsonDoc["cmd"] = "Led";
                jsonDoc["Button"] = bvalue;
            }

            jsonDoc["name"] = deviceName;
            jsonDoc["method"] = "get";
            jsonDoc["uuid"] = uuid;

            serializeJson(jsonDoc, buffer);

            mqtt->publish(responseTopic, buffer);
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

        mqtt->publish(responseTopic, buffer);
    }

    return 0;
}

// --------------------------------------------- Subscribe to a Topic
//
int MQTTSubscribe()
{

    strcpy(subTopic, "CommandTopic_");
    strcat(subTopic, deviceName);

    if (mqtt->isConnected())
    {

        mqtt->subscribe(subTopic);

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
    strncpy(deviceName, data, strlen(data));

    nameReceived = true;
}

void meshReceiver(const char *event, const char *data)
{

    mqtt->publish(pubTopic, data);
}