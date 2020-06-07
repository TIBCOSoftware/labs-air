---
title: "Install infrastructure on AWS"
linkTitle: "Install infrastructure on AWS"
weight: 1
description: >
  Installation of Project AIR™ on Amazon Web Services (AWS)
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

Enter the AWS information when prompted (Note: To avoid prompt look at the Advanced install configuration section [here](#advanced-install-configuration))

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


## Advanced install configuration
There is a way to avoid being prompted for your credentials as well as adding advanced configuration.

You need to create a config.yaml file with the following content:

```
aws:
  AWS_ACCESS_KEY_ID: <YOUR ACCESS KEY ID HERE>
  AWS_SECRET_ACCESS_KEY: <YOUR SECRET ACCESS KEY ID HERE>
  AWS_DEFAULT_REGION: <YOUR DEFAULT REGION HERE>
```

Then just mount a volume with the config.yaml file when calling the cli for example:

```
docker run -it -v /path/to/config/file/:/configuration tibcosoftware/labs-air-aws-cli air install
```

### Advanced configuration for Assuming a different role

Add the following entry to the config.yaml file:

```
aws:
  ...<Your previous configuration goes here>...
  AWS_ASSUME_ROLE_ARN: "<Add your Role ARN>"
  AWS_ASSUME_ROLE_SESSION_DURATION: "<Add your session duration for example 3600>"
```

Note that the role session duration also implies how often you need to "air upgrade-charts" refresh the token

### Advanced configuration for choosing a different cluster name

Sometimes if you are shareing an AWS account you want to choose a different kubernetes cluster name.

```
aws:
  ...<Your previous configuration goes here>...
  KUBE_CLUSTER_NAME: "<Your cluster name>"
```


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

Enter the AWS information when prompted (Note: To avoid prompt look at the Advanced install configuration section [here](#advanced-install-configuration))

```
Please enter your AWS_ACCESS_KEY_ID:

Please enter your AWS_SECRET_ACCESS_KEY:
```

## Troubleshooting

### AlreadyExistException

If you get a message similar to this

```
[✖]  creating CloudFormation stack "eksctl-air-cluster-cluster": AlreadyExistsException: Stack [eksctl-air-cluster-cluster] already exists
        status code: 400, request id: a4eba6b2-bd4a-475d-b3a1-93fc6cfd5d1f
```

This means that there is an already existing cluster with that name the solution is:

1.- Delete the cluster, go [here](#uninstallation-steps) for more information.

2.- Create a cluster with a different name, go [here](#advanced-configuration-for-choosing-a-different-cluster-name) for more information.




