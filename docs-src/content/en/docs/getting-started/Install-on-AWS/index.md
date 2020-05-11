---
title: "Install on AWS"
linkTitle: "Install on AWS"
weight: 1
description: >
  Installation of Project Air on Amazon Web Services (AWS)
---

## Introduction
The following steps will guide you through the full infrastructure installation on Amazon Web Services.

## Prerequisites

#### Prerequisite 1: Docker
Air's CLI is wrapped in a docker container to ease the installation process:

* [Docker](https://www.docker.com/get-started)

#### Prerequisite 2: AWS Account Information
All the infrastructure components needed for Project Air will be installed in your provided AWS account, you will need the following information to install it:

Your AWS access and secret keys: More information [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)

## Installation Steps

#### Step 1: pull aws cli

```
docker pull tibcosoftware/labs-air-aws-cli
```

#### Step 2: call install command on cli

Note: This installation installs a Kubernetes cluster using EKS in your aws account so it takes around ~20minutes to finish.

```
docker run -it tibcosoftware/labs-air-aws-cli air install
```

Enter the AWS information when prompted

```
Please enter your AWS_ACCESS_KEY_ID:

Please enter your AWS_SECRET_ACCESS_KEY:
```

#### Step 3 [optional]: check installation

This command will allow you to connect to the kubernetes cluster to see the different components

```
docker run -it -p 8001:8001 tibcosoftware/labs-air-aws-cli air dashboard
```

Copy the token printed in the terminal

And follow the dashboard link also printed in the terminal




Congratulations!! Project Air infrastructure has been installed



## Uninstallation Steps

#### Step 1: pull aws cli

```
docker pull tibcosoftware/labs-air-aws-cli
```

#### Step 2: call delete command on cli

Note: This installation deletes the Kubernetes cluster.

```
docker run -it tibcosoftware/labs-air-aws-cli air delete
```

Enter the AWS information when prompted

```
Please enter your AWS_ACCESS_KEY_ID:

Please enter your AWS_SECRET_ACCESS_KEY:
```




