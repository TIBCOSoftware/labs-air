## Component: <%= name %>

![Status][auto] ![Component Type][major] <!--Component Meta {"created_by":"Auto", "reviewed_by":"Auto", "last_modified_by":"Auto", "comment":"high level component"} Component Meta -->


<p>High level component to allow interaction with case.</p>

<p>  <img src="../live-apps-case-cockpit.png" alt="alt-text" class="img-responsive" title="Image"></p>



#### Usage


This Component can be used by using the following HTML Tag:

```html
<tcla-live-apps-case-cockpit></tcla-live-apps-case-cockpit>
```

#### Inputs

Attribute | Type | Comments
--- | --- | ---
access | RouteAccessControlConfig | RouteAccessControlConfig - basically the config for access control
appId | string | The LA Application Id
caseRef | string | The case reference
customFormDefs | CustomFormDefs | Custom Form configuration file
exclRecentAppIds | string[] | The list of LA Application Ids you want to mark as recent cases when accessed
layout | any[] | Layout object that can be passed to override default layout of the form renderer
roles | Roles | Roles - The users current roles
sandboxId | number | sandboxId - this comes from claims resolver
typeId | string | The LA Application Type Id (generally 1)
uiAppId | string | The Application ID of the UI (should ideally be unique as it is shared state key)
userId | string | The ID of the logged user

#### Outputs

Attribute | Type |   | Comments
--- | --- | --- | ---
routeAction | EventEmitter<RouteAction> |   |  
  | Event |  routeAction  |  Component requests route to another page
  | Payload |  RouteAction  |  RouteAction object to tell caller to navigate somewhere


<b>full development Documentation</b>

[Link to LiveAppsCaseCockpitComponent](https://tibcosoftware.github.io/TCSTK-Angular/libdocs/tc-liveapps-lib/components/LiveAppsCaseCockpitComponent.html)


[auto]: https://img.shields.io/badge/Status-auto%20generated-lightgrey.svg?style=flat "auto generated"

[manually]: https://img.shields.io/badge/Status-manually%20created-yellow.svg?style=flat "manually created"

[draft]: https://img.shields.io/badge/Status-draft-red.svg?style=flat "draft"

[review]: https://img.shields.io/badge/Status-need%20review-yellowgreen.svg?style=flat "need review"

[review done]: https://img.shields.io/badge/Status-review%20done-green.svg?style=flat "review done"

[finalized]: https://img.shields.io/badge/Status-finalized-brightgreen.svg?style=flat "finalized"

[top]: https://img.shields.io/badge/Component%20Type-Top-blue.svg?style=flat "top Component"

[major]: https://img.shields.io/badge/Component%20Type-major%20Component-blue.svg?style=flat "major Component"

[minor]: https://img.shields.io/badge/Component%20Type-minor%20Component-blue.svg?style=flat "minor Component"


