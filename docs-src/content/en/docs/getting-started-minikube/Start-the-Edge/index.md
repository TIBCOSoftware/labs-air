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

#### Step 1: Download basic demo

Download the [basic demo file](../../basicdemo.zip)

Unzip basicdemo.zip



#### Step 2: Configure basic demo

First let's get the service list

```
minikube service list
```

You should see something like this:

```
|----------------------|------------------------------------|--------------------|-----------------------------|
|      NAMESPACE       |                NAME                |    TARGET PORT     |             URL             |
|----------------------|------------------------------------|--------------------|-----------------------------|
| default              | kubernetes                         | No node port       |
| default              | minikube-air-app-manager-service   | appmanager-http/80 | http://192.168.99.117:30640 |
| default              | minikube-air-cors-anywhe-service   | ca-http/80         | http://192.168.99.117:31118 |
| default              | minikube-dgraph-alpha              | No node port       |
| default              | minikube-dgraph-alpha-headless     | No node port       |
| default              | minikube-dgraph-ratel              | No node port       |
| default              | minikube-dgraph-zero               | No node port       |
| default              | minikube-dgraph-zero-headless      | No node port       |
| default              | minikube-mosquitto-service         | mosquitto/443      | http://192.168.99.117:30987 |
| kube-system          | ingress-nginx-controller-admission | No node port       |
| kube-system          | kube-dns                           | No node port       |
| kubernetes-dashboard | dashboard-metrics-scraper          | No node port       |
| kubernetes-dashboard | kubernetes-dashboard               | No node port       |
|----------------------|------------------------------------|--------------------|-----------------------------|
```


Then, let's use those endpoints to configure the Edge example.

```
cd basicdemo
```

Modify basicdemo/.env file which is used to provide AIR environment variables to docker-compose

Open the file and replace the following variables using values for your environment and the information returned from the service list:

```
GATEWAY_ID=changeme
AIR_MQTT_HOSTNAME=changeme
AIR_MQTT_PORT=changeme
AIR_MQTT_USER=mqtt_admin
AIR_MQTT_PASSWORD=mqtt_admin
AIR_MQTT_DATA_TOPIC=EdgexGatewayData
AIR_MQTT_NOTIFICATION_TOPIC=EdgexGatewayNotification
```

Please note that the GATEWAY_ID is the name that will be used when you configure your device groups in the AIR UI.


#### Step 3: run the basic demo

Inside your basicdemo folder run

```
./startEdgex.sh
```

#### Step 4: get the basic demo security token

Inside your basicdemo folder run

```
./getSecurityToken.sh
```

Copy the access token for tibuser, you will need it for the edge group registration.

Congratulations!! Project Air edge basic demo is running


## Uninstallation Steps

#### Step 1: stop the demo

Inside your basicdemo folder run

```
./stopEdgex.sh
```

