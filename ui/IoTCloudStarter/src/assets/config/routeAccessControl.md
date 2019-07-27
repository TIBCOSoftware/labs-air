###### Configuration file name

routeAccessControl.json

###### Configuration file description

This file is used to setup ACLs for your routes and buttons

###### Example
```javascript
{
  "routes": [  // <== List of routes you want to protect
    {
      "routeUrl": "configuration",      // <== route name
      "requiredRoleId": "Administrator" // <== role to have to access the route
    }
  ],
  "buttons": [
    {
      "buttonId": "configure",          // <== button name
      "requiredRoleId": "Administrator" // <== role to have to view the button
    },
    {
      "buttonId": "caseStart",
      "requiredRoleId": "User"
    },
    {
      "buttonId": "refresh",
      "requiredRoleId": "User"
    },
    {
      "buttonId": "favorite",
      "requiredRoleId": "User"
    }
  ]
}
```

**Notes** 

If a route or button is not mentioned, it will be available for all






