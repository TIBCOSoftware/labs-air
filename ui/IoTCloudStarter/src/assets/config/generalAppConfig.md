###### Configuration file name

generalAppConfig.json

###### Configuration file description

This file is used to initialise on first browse the General app values that could be updated here : in the configuration subsections

Setting subsection

![enter image description here](./generalAppConfig-settings.png)

Role subsection

![enter image description here](./generalAppConfig-roles.png)


###### Example
```javascript
{
  "browserTitle": "Tibco Cloud App",
  "applicationTitle": "Case Manager App (TIBCO LABS™)",
  "welcomeMessage": "Welcome to the Case Manager App",
  "roles": [
    {
      "id": "User",
      "group": "System: ALL_USERS",
      "display": "User"
    },
    {
      "id": "Administrator",
      "group": "System: ADMINISTRATOR",
      "display": "Administrator"
    }
  ],
  "displayName": true,   //  <== display Username in main APP Bar.
  "documentationUrl": "assets/help.html"
}
```





