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

First: Get minikube ip

```
minikube ip
```

Second: Get the service list

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

Then, let's use those endpoints to configure the UI.

Open the file proxy.conf.prod.us.json and replace the following entries at the end of the json file with the endpoints from previous step.

```
  "/edgex/remotegateway/*": {
    "target": "http://<Add-Your-minikube-air-cors-anywhe-service-Enpoint-Here>",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info",
    "pathRewrite":{"^/edgex/remotegateway" : ""}
  },
  "/airEndpoint/*": {
    "target": "http://<Add-Your-minikube-ip-Here>",
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






