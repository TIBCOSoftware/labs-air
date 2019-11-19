# TIBCO Cloud Quick Starter Kit

This repository is a starter kit to get going with TIBCO Cloud Starters

### Create your first Cloud App

To create your first app run

```bash
ng new --collection=@tibco-tcstk/application-template MyCloudStarter
```

### Create your own cloud component

```bash
ng generate @tibco-tcstk/component-template:comp-base --name base
ng generate @tibco-tcstk/component-template:comp-events --name events
ng generate @tibco-tcstk/component-template:comp-liveapps --name liveapps
ng generate @tibco-tcstk/component-template:comp-spotfire --name spotfire
ng generate @tibco-tcstk/component-template:comp-tci --name tci
ng generate @tibco-tcstk/component-template:home-cockpit --name cockpit
```


### To publish, simply do:

```bash
npm run build
npm publish  
npm publish  --registry http://application-lb-npm-1392137160.eu-west-1.elb.amazonaws.com/#/
npm install
```

That's it!
