---
title: "Pipeline Activities"
weight: 3
date: 2020-05-25T12:33:17-04:00
draft: false
description: >
    The following activities are available by default in all pipelines. It consists of subscribers, activities and publishers that may be commonly used by any pipeline. A subscriber initiates the pipeline in which it appears. An activity is used to perform a task on the data received by a subscriber. A publisher is used publish data to other pipelines or to other systems.
---

## Introduction
 Projet AIR pipeline editor is a wizard driven tool that allows you to create data pipelines or data flows.
 Each pipeline represents specific business logic in an app. A pipeline or data flow contains one or more activities. 

 The pipelines allow you to implement the business logic as a process. You can visually design the flows using the UI. A pipeline can consist of one or more activities that perform a specific task. Activities are linked in order to facilitate the flow of data between them. The pipeline execution is started by a subscriber.

 The following activities are available by default in all pipelines. It consists of subscribers, activities and publishers that may be commonly used by any pipeline. A subscriber initiates the pipeline in which it appears. An activity is used to perform a task on the data received by a subscriber. A publisher is used publish data to other pipelines or to other systems.
 

## Data Subscriber
Data Subscriber is used to receive events and activate a pipeline. Events are originated from IoT devices.

Data Subscriber receive IoT events from data sources such as MQTT, Kafka, AMQP and so on. 

Project AIR pipelines receive events with the following JSON schema which is propagated through all the pipeline.

After adding a subscriber activity, you must configure it with the transport protocol from the list of configured protocols.


```JSON
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "origin": {
            "type": "number"
        },
        "device": {
            "type": "string"
        },
        "gateway": {
            "type": "string"
        },
        "readings": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string"
                    },
                    "origin": {
                        "type": "number"
                    },
                    "device": {
                        "type": "string"
                    },
                    "name": {
                        "type": "string"
                    },
                    "value": {
                        "type": "string"
                    }
                }
            }
        }
    }
}
```
<!--   VERSION 2
```JSON
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "origin": {
            "type": "number"
        },
        "deviceName": {
            "type": "string"
        },
        "gateway": {
            "type": "string"
        },
        "readings": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string"
                    },
                    "origin": {
                        "type": "number"
                    },
                    "deviceName": {
                        "type": "string"
                    },
                    "resourceName": {
                        "type": "string"
                    },
                    "profileName": {
                        "type": "string"
                    },
                    "valueType": {
                        "type": "string"
                    }
                    "value": {
                        "type": "string"
                    }
                }
            }
        }
    }
}
``` -->

## Filter
When creating a flow, you may want to filter out data from certain resources (sensors) or from certain devices. You can do this by adding a Filter activity in your flow and configure the Filter activity to filter specific devices and resources. 

For events that meet the filter condition, the pipeline or flow will terminate.  For events not meeting the filter condition, the flow will continue to the next activity.


## REST Service
The REST activity is used to make a request to a REST service; it also accepts the reply returned by the service.


## Inferencing
The Inferencing activity is a REST Service activity customized to call ML Models exposed as REST serives.  The service is configured using the Models Endpoints interface where users can provide the service URL and the input mappings for the service.

Results from the inference service will be propagated through the pipeline as a new resource.  The name of the new resource will postfixed with the word "Inferred".  For example, if the name of the resource used by the model is temperature, the name of the inferred result will be temperature_Inferred.

## Data Publisher
Data Publisher is used to send events originating from IoT devices to external applications or other pipelines.

Data Publisher sends IoT events to message brokers such as MQTT, Kafka, AMQP and so on. 

Data Publisher uses the same schema as received by the Data Subscriber.

After adding a Data Publisher activity, you must configure it with the transport protocol from the list of configured protocols.



## Rules
The Rules activity is used to implement basic rules on data coming from IoT devices.

A Rule constitutes of multiple Conditions and the rule triggers when all its conditions pass.

A Condition is an expression involving data from the IoT device. When the expression evaluates to true, the condition passes.

A Action is a function that is invoked each time the evaluation of all its conditions is true.

One of the actions of the Rules activity is a notification.  The notification can be send to external application by using the Notification Publisher activity.

## Streaming
IoT devices have the potential for producing millions or even billions of events at rapid intervals, often times the events on their own are meaningless, hence the need to provide basic streaming operations against the slew of events.

The Streaming activity provides the following functionality:

Enables apps to implement basic streaming constructs in a simple pipeline fashion
Provides non-persistent state for streaming operations
Streams are persisted in memory until the end of the pipeline
Serves as a pre-process pipeline for raw data to perform basic mathematical and logical operations. Ideal for feeding ML models
Filter out the noise with stream filtering capabilities

After adding a Streaming activity, you must configure it with the desired device resource to stream, the operation to use to aggregate events, and the type of aggregation window to use.

## Data Store
The Data Store activity enables users to run SQL insert operation on several supported data stores like Postgres, Oracle, Snoflake, MySQL, etc, and store IoT device data to the selected data store.

After adding a Data Store activity, you must configure it with the desired data store from the list of configured data stores.


## Notification Publisher
The Notification Publisher activity allows users to send notification messages to external applications. The activity can be placed after activities generating notifications like the Rule activity.  All the notifications generated by the activity will be routed to the Notification activity and send to external applications using the pre-configured messaging protocol.


## Flogo Flow
TIBCO Labs Project AIR pipelines allow users to import TIBCO Flogo applications and be deployed to the edge as any other project AIR pipeline. 

After adding a Flogo Flow activity, you must configure it with the desired service port and the json file containing the Flogo App configuration.  The user can also overrride properties values exposed by the Flogo application.
