---
title: "Start the UI"
linkTitle: "Start the UI"
weight: 3
description: >
  Run the UI locally
---

## Introduction
The following steps will guide you through the configuration and how to run the UI locally.

## Prerequisites

#### Prerequisite 1: Git
Air's UI is located in a github repository:

* [Git](https://git-scm.com/)

#### Prerequisite 2: npm
Air's UI is an angular application that uses npm to install dependencies:

* [npm](https://www.npmjs.com/)

## Running Steps

#### Step 1: clone UI

```
git clone https://github.com/TIBCOSoftware/labs-air-ui.git
```

#### Step 2: configure UI endpoints
In this steps we are connecting the UI to Air's infrastructure endpoints

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

Then, let's use those endpoints to configure the UI.

Open the file proxy.conf.prod.us.json and replace the following entries at the end of the json file with the endpoints from previous step.

```
  "/edgex/remotegateway/*": {
    "target": "http://<Add-Your-air-cors-anywhere-service-Enpoint-Here>",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info",
    "pathRewrite":{"^/edgex/remotegateway" : ""}
  },
  "/airEndpoint/*": {
    "target": "http://<Add-Your-ingress-nginx-controller-Enpoint-Here>",
    "secure": "false",
    "changeOrigin": true,
    "logLevel": "info",
    "pathRewrite":{"^/airEndpoint" : ""}
  }
```


#### Step 3: npm install

```
cd labs-air-ui
npm install
```

#### Step 4: start the UI

```
npm run serve_us
```

Congratulations!! Project Air UI is started on https://localhost:4200






