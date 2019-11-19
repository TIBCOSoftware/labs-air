## Deployment

### Build
to make an App ready for Deployment you need to run

```
npm run build_prod
```

and a App Zip file is created into the 'dist' Folder.

#### Upload

Afterwards the Zip con be uploaded to TIBCO Cloud LiveApps Web Resource Provisioning (WRP) using the Swagger UI delivered within the API Documentation or using Postman.

direct Link - API-Explorer :: Content Management

Web Resource Provisioner Service (WRP)
[POST /applications/{appName}/upload/](https://eu.liveapps.cloud.tibco.com/apps/api-explorer/index.html#/swaggerUi?feature=..~2Fyaml~2Fwr-v01.yaml)

Just specify an 'AppName' and select the App.zip File.

![](004-swagger.png)

> Alternatively a CLI Tool can be used.

#### configure Users and Roles

For this Case Manager App two Groups can be configured for the following Roles

- Users (default all Users)
- Administrators (default all Users)

To Limit Access you can create own Groups in the Live Apps Administration UI and
grant access from the App Configurator View.

![](004-new-group.png)

> For more Details check 'App Settings', too.
