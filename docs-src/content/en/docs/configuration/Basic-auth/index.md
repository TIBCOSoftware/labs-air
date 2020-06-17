---
title: "Basic Authentication"
linkTitle: "Basic Authentication"
weight: 2
description: >
  Basic Authentication
---

## Introduction
Project Air provides with basic authentication out of the box, this basic auth can be configured and even removed if desired.

> Note: It is highly encouraged to change the default basic authentication secrets to your own secrets.

## How to override default basic auth configuration
In order to override the basic auth configuration the following is needed

Step 1.-  Create a new secret overriding the basic auth values

To create your new secret in a terminal create the auth file (Replace <YourDesiredUsername> with your username for example admin)

```
htpasswd -c auth <YourDesiredUsername>
base64 auth
```

Step 2.- Override secret on install or upgrade

In this step we are going to use secret created in Step 1.

Create a new override-values.yml file as defined in [here](../infrastructure-config#how-to-override-configuration) with the current content:

```
basicauth:
  secret: <AddYourSecretHere>
```

Step 3.- Use the new override-values.yaml to install or upgrade air infrastructure

> More information about overriding values [here](../infrastructure-config#how-to-override-configuration)

Step 4.- Change UI to use new BasicAuth http headers

Open labs-air-ui/src/app/services/auth/auth.service.ts and replace the line <AddYourBase64BasicAuthHere> with your base64 header.

```
this.basicAuthHeaders = {
        'Authorization': 'Basic <AddYourBase64BasicAuthHere>'
    }
```



  



