###### Configuration file name

customForms.json

###### Configuration file description

This file is used if you want to overwrite default forms by custom created forms

###### Example
```javascript
{
  "customForms": [    // <== List of forms that are customs
    "Partner Request.PartnerRequest.creator.New Product Notification_Disabled"
  ]
}
```

**Notes** 
Every entry should follow the convention below:

```
<applicationName>.<applicationInternalName>.<processType>.<processName>
```





