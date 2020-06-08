---
title: "Install infrastructure on Minikube"
linkTitle: "Install infrastructure on Minikube"
weight: 1
description: >
  Installation of Project AIR™ on your computer using Minikube
---

## Introduction
The following steps will guide you through the full infrastructure installation on Minikube.

## Prerequisites

#### Prerequisite 1: Docker
Air's CLI is wrapped in a docker container to ease the installation process:

* [Docker](https://www.docker.com/get-started)

#### Prerequisite 2: Minikube
All the infrastructure components needed for Project Air will be installed in your provided minikube cluster 

More information to install minikube [here](https://kubernetes.io/docs/tasks/tools/install-minikube/)

## Installation Steps

#### Step 1: start minikube

```
minikube start
```

Note: make sure your driver is correct and that the minikube installation is correct as indicated [here](https://kubernetes.io/docs/tasks/tools/install-minikube/#confirm-installation)

#### Step 2: enable ingress

```
minikube addons enable ingress
```

#### Step 3: pull minikube cli

```
docker pull tibcosoftware/labs-air-minikube-cli
```

#### Step 4 [FOR MAC USERS]: call install command on cli

In one terminal 

```
kubectl proxy --port=8080 --disable-filter=true
```

In a different terminal

```
docker run -e MINIKUBE_IP=$(minikube ip) -it --network host -v ${HOME}/.minikube:/.minikube -v ${HOME}/.kube:/.kube -e MINIKUBE_HOST_OS=mac tibcosoftware/labs-air-minikube-cli air install
```

#### Step 4 [FOR LINUX USERS]: call install command on cli

In one terminal 

```
kubectl proxy --port=8080
```

In a different terminal

```
docker run -e MINIKUBE_IP=$(minikube ip) -it --network host -v ${HOME}/.minikube:/.minikube -v ${HOME}/.kube:/.kube tibcosoftware/labs-air-minikube-cli air install
```

#### Step 4 [FOR WINDOWS USERS]: call install command on cli

In one terminal 

```
kubectl proxy --port=8080 --disable-filter=true
```

In a different terminal

```
docker run -e MINIKUBE_IP=$(minikube ip) -it --network host -v ${HOME}/.minikube:/.minikube -v ${HOME}/.kube:/.kube -e MINIKUBE_HOST_OS=windows tibcosoftware/labs-air-minikube-cli air install

#### Step 5 [optional]: check installation

This command will allow you to connect to the kubernetes cluster to see the different components

```
minikube dashboard
```

Congratulations!! Project Air infrastructure has been installed

## Uninstallation Steps

#### Step 1: pull minikube cli

```
docker pull tibcosoftware/labs-air-minikube-cli
```

#### Step 2: call delete command on cli

```
docker run -it tibcosoftware/labs-air-minikube-cli air delete
```

#### Step 3: delete minikube

Note: This installation deletes the Kubernetes cluster.

```
minikube delete
```