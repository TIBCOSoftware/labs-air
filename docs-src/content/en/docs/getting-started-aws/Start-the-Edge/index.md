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

First let's query the endpoints

```
docker run -it tibcosoftware/labs-air-aws-cli air show-endpoints
```

You should see 3 endpoints being displayed something like:

```
{'service_name': 'core-air-cors-anywhere-service', 'hostname': '<someawsdns>.us-west-2.elb.amazonaws.com', 'ports': [80]}


{'service_name': 'core-ingress-nginx-controller', 'hostname': '<someawsdns>.us-west-2.elb.amazonaws.com', 'ports': [80, 443]}


{'service_name': 'core-mosquitto-service', 'hostname': '<someawsdns>.us-west-2.elb.amazonaws.com', 'ports': [443]}
```

Then, let's use those endpoints to configure the Edge example.

```
cd basicdemo
```

Modify basicdemo/export_mqtt/configuration.toml

Replace '\<Add-Your-minikube-mosquitto-service-Enpoint-Here\>' with your mosquitto-service endpoint also ensure the port is correct.


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

