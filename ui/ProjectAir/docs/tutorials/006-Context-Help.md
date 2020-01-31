## Help Pages

### Create context sensitive help

In order to provide the user help on the page that he actually sees you can create context sensitive help.
To do this all you need to do is create the help pages structure in the `src/assets/help` folder.
This structure follows exactly the route that the user sees.

The various pages in the assets folder(s) *always needs* to be called `help.html` !

In case no Help is defined you will see just the following

![](006-context-help-empty.png)

> We do not provide an App Internal Context Help files yet.

#### Help Routing

So for example the user goes to the page:

```https://eu.liveapps.cloud.tibco.com/webresource/apps/ProjectAir/index.html#/starterApp/home```

You can set a help page in:

```src/assets/help/starterApp/home/help.html```

However when you don't set this help page the context sensitive help will look one level higher each time. 
So first in:

```src/assets/help/starterApp/help.html```

and then in:

```src/assets/help/help.html```

#### Default Help fall back

If it can't find a help page it will fall back on:

```src/assets/help.html```

With this mechanism you can make your help very specific based on the route.
