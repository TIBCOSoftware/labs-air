## Configure

The Case Manager App comes with easily adjustable Configuration Settings, most of them can be adjusted at anytime within the Application itself in case the User has the "App Configuration Role". In this Case the Settings saved to the App specific Shared State.

> In case the Application is installed the first time, the Settings are taken from JSON Configuration Files delivered with the App. These JSON Files contain some more detailed Settings as what is available via the UI.

### General Application Settings

allows to adjust e.g. application title, welcome message, help content

![](002-app-settings-overview.png)

### Application Roles

allows to change application roles for normal users, administrators and configurators.

![](002-app-settings-roles.png)

### Landing Page

You can adjust everything you can find on the App Landing Page, make the App more use case specific and re-branded. Even to change the Background Image is quickly possible.

![](002-app-settings-landing.png)

### App Selection

Only the here selected TIBCO Cloud™ Live Apps of your Subscription are available within the App. This allows you to deploy multiple 'Case Manager Apps' with different 'uiAppId' (config JSON) and see only some relevant Case Types within one App.

![](002-app-settings-apps.png)

### Recent Cases

Here you can configure what kind of Cases you like to see in the Overview 'Recent Cases' Component.

![](002-app-settings-recent.png)

### Summary Cards

The Look and Feel of all Case Summary Cards can be adjusted as well, including colors and SVG State Icons displayed. e.g. you can quickly make exception case state red.

![](002-app-settings-casecards.png)

## Configuration Files

All pre-defined Configurations can be found in the folder.

```
src/assets/config
```

Details about the Files can be found it App Config Section of this Documentation Site.

> Note: adjustments in the JSON Files not updating the Shared State after the App is started once, as the Shared State exists already. You can use the Shared Client State Service API to delete an already initializes App Shared State again.

## Shared State

TIBCO Cloud™ Live Apps Shared Client State Service provides a mechanism for storing and publishing UI state information. For these client-specific customization parameters we use just the PUBLIC State - This type of State can be read by all users in the subscription, but can be updated or deleted only by users with App OWNER or AUTHOR roles.
