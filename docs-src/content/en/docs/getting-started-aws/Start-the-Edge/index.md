---
title: "Start the Edge"
linkTitle: "Start the Edge"
weight: 2
description: >
  Run Edgex foundry at the edge with a basic example
---

## Introduction
The following steps will guide you through the configuration and how to run the edge elements locally.

## Prerequisites

#### Prerequisite 1: Docker
Air's CLI is wrapped in a docker container to ease the installation process:

* [Docker](https://www.docker.com/get-started)

## Running Steps

#### Step 1: Get Project AIR Infrastructure endpoints

Query the endpoints. Take note of the returned information as it will be used to configure AIR Edge components in subsequent steps.

```
docker run -it tibcosoftware/labs-air-aws-cli air show-endpoints
```

You should see 3 endpoints being displayed something like:

```
{'service_name': 'core-air-cors-anywhere-service', 'hostname': '<someawsdns>.us-west-2.elb.amazonaws.com', 'ports': [80]}


{'service_name': 'core-ingress-nginx-controller', 'hostname': '<someawsdns>.us-west-2.elb.amazonaws.com', 'ports': [80, 443]}


{'service_name': 'core-mosquitto-service', 'hostname': '<someawsdns>.us-west-2.elb.amazonaws.com', 'ports': [443]}
```

#### Step 2: Download basic demo

Download the [basic demo file](../../basicdemo.zip)

Unzip basicdemo.zip

Then, change to the folder just unzipped 

```
cd basicdemo
```

#### Step 3: Start Edgex Core components

Inside your basicdemo folder run

```
./startEdgex.sh
```

#### Step 4: Get Edgex Gateway API security token

Inside your basicdemo folder run

```
./getSecurityToken.sh
```

Copy the access token for tibuser, you will need it to configure AIR components.

#### Step 5: Configure Edgex AIR Components

Use the information from step 1 (endpoints) and step 4 (security token) to modify the basicdemo/.env file.  This file is used to provide AIR environment variables to docker-compose. 

Open the file and replace the following variables using values for your environment and the information returned from the service list:

```
GATEWAY_ID=changeme
GATEWAY_DESCRIPTION=changeme
GATEWAY_HOSTNAME=localhost
GATEWAY_LATITUDE=36.0
GATEWAY_LONGITUDE=-98.0
GATEWAY_ACCESS_TOKEN=changeme
GATEWAY_METADATA_PUBLISH_INTERVAL_SECS=30
AIR_MQTT_HOSTNAME=changeme
AIR_MQTT_PORT=changeme
AIR_MQTT_USER=mqtt_admin
AIR_MQTT_PASSWORD=mqtt_admin
AIR_MQTT_DATA_TOPIC=EdgexGatewayData
AIR_MQTT_NOTIFICATION_TOPIC=EdgexGatewayNotification
```

Please note that the GATEWAY_ID is the identifier that will be used to identify your deployment in the AIR UI.

#### Step 6: Start Edgex AIR components

Inside your basicdemo folder run

```
./startEdgeAIR.sh
```


Congratulations!! Project Air edge basic demo is running


## Uninstallation Steps

#### Step 1: stop the demo

Inside your basicdemo folder run

```
./stopEdgex.sh
```

