---
title: "Infrastructure Config"
linkTitle: "Infrastructure Config"
weight: 1
description: >
  Infrastructure Configuration
---

## Introduction
Project Air's infrastructure is mainly composed of [helm charts](https://helm.sh/) that run on a [kubernetes](https://kubernetes.io/) cluster, which makes overriding the default configuration very simple.

## How to override configuration
During "air install" or "air upgrade-charts" commands a values.yml file can be passed as a parameter that will override the default configuration (more information about helm values files [here](https://helm.sh/docs/chart_template_guide/values_files/)).

In order to pass the values.yml file 2 things are needed:

1.- Mount your "values.yml" file using the docker option -v, more info about docker volumes [here](https://docs.docker.com/storage/volumes/)

2.- Pass --values flag to "air install" or "air upgrade-charts" command

For example to increase the mosquitto pod number create a file called override-values.yml

```
mosquitto:
  deployment:
    replicaCount: 2
```

Then use that file when calling "air install" or "air upgrade-charts"

Command example overriding default values:

```
docker run -e MINIKUBE_IP=$(minikube ip) -it --network host -v ${HOME}/.minikube:/.minikube -v ${HOME}/.kube:/.kube -v /path/to/override-values/folder:/values -e MINIKUBE_HOST_OS=mac tibcosoftware/labs-air-minikube-cli air install --values /values/override-values.yaml
```

> Note: **-v /path/to/override-values/folder:/values** (Will mount your override-values.yml inside the container)

> Note: **--values /values/override-values.yaml** (Parameter with the file path that will override the helm values)




