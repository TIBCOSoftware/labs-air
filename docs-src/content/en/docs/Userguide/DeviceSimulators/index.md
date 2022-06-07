---
title: "Device Simulators"
weight: 3
date: 2020-05-25T12:33:17-04:00
draft: false
description: >
    Project AIR provides device adapters to allow end users to connect to real devices or to simulate generation of events and readings without having any real devices.
    
    The events and reading go to the Edgex core data micro services and propagated to project AIR pipelines. 

---

## Introduction
Project AIR provides device adapters to allow end users to simulate generation of events and readings without having any real devices.
    
The events and reading go to the Edgex core data micro services and propagated to project AIR pipelines. 
 

## REST Device

This device service provides easy way for any application to push data into EdgeX via the REST protocol.

The service provides the following resources for simulating data of different data types:
- int16_reading - simulates a resource/sensor generating integer readings
- float32_reading - simulates a resource/sensor generating float readings
- bool_reading - simulates a resource/sensor generating boolean readings
- str_reading - simulates a resource/sensor generating string readings
- image_reading - simulates a resource/sensor generating image readings

### REST Endpoints
This device service provides the following REST endpoints:

http://<ip-address>:49565/api/v1/resource/RESTDevice/{resourceName}

resourceNamerefers to the device resource names listed above.


### Testing/Simulation
The best way to test this service with simulated data is to use PostMan to send data to the following endpoints.

http://localhost:49565/api/v1/resource/RESTDevice/image_reading

POSTing an image file (jpeg or png) will result in the BinaryValue of the Reading being set to the JPEG/PNG image data posted.
Example test JPEG to post:
Select any JPEG file from your computer or the internet


http://localhost:49565/api/v1/resource/RESTDevice/int16_reading

POSTing a text integer value will result in the Value of the Reading being set to the string representation of the value as an Int16. The POSTed value is verified to be a valid Int16 value.

A 400 error will be returned if the POSTed value fails the Int16 type verification.

Example test int value to post:

1001

http://localhost:49565/api/v1/resource/RESTDevice/float32_reading

POSTing a text float value will result in the Value of the Reading being set to the string representation of the value as an Float32. The POSTed value is verified to be a valid Float32 value.

A 400 error will be returned if the POSTed value fails the Float32 type verification.

Example test float value to post:

500.56

http://localhost:49565/api/v1/resource/RESTDevice/bool_reading

POSTing a text boolean value will result in the Value of the Reading being set to the string representation of the value as a Bool. The POSTed value is verified to be a valid boolean value.

A 400 error will be returned if the POSTed value fails the Boolean type verification.

Example test boolean value to post:

true


http://localhost:49565/api/v1/resource/RESTDevice/str_reading

POSTing a text value will result in the Value of the Reading being set as a string. 

Example test string value to post:

abc


## MQTT Device

This device service provides easy way for any application to push data into EdgeX via the MQTT protocol.

The device service connects a MQTT topic to EdgeX acting like a device/sensor feed.

The service provides the following resources for simulating data of different data types:
- int16_reading - simulates a resource/sensor generating integer readings
- float32_reading - simulates a resource/sensor generating float readings
- bool_reading - simulates a resource/sensor generating boolean readings
- str_reading - simulates a resource/sensor generating string readings
- image_reading - simulates a resource/sensor generating image readings

MQTT Topic
This device subscribes to a MQTT Topic (/generic/event).  When a value is received it passes to the Edgex core data micro services and propagated to project AIR pipelines. 

The following examples illustrate the json message required for sending data for the above described resources.


{"deviceName":"MQTTDevice","resourceName":"int16_reading","int16_reading":100}

{"deviceName":"MQTTDevice","resourceName":"float32_reading","float32_reading":100.0}

{"deviceName":"MQTTDevice","resourceName":"str_reading","str_reading":"test1"}

{"deviceName":"MQTTDevice","resourceName":"bool_reading","bool_reading":true}