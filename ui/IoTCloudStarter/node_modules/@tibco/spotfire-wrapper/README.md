# Spotfire-Wrapper

This is the home for the __Spotfire Wrapper Package__.
Spotfire Webplayer is an Angular Component built for and with Angular.

### Installation:
```bash
$ npm install @tibco/spotfire-wrapper --registry http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general
```

To let know `npm` tool that packages with `@tibco` scope need to be retrieved from artifactory, you may type this command once (it will update your `~/.npmrc` file): 
```bash
npm config set @tibco:registry http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general"
```
Next you can type any of these commands, and `npm` will look into the right repository:
```bash
npm install @tibco/spotfire-wrapper@latest --save
npm outdated -l
npm update
````

__Really easy to get started !__

```typescript
import { BrowserModule        } from '@angular/platform-browser';
import { NgModule, Component  } from '@angular/core';
import { SpotfireViewerModule } from '@tibco/spotfire-wrapper';

@Component({
  selector: 'app-root',
  styles: [` spotfire-viewer { height: 300px; }`],
  template: `
  <spotfire-viewer
      [url]="url"
      [path]="path"
      [customization]="cust"
      [markingOn]="mon"
      [maxRows]="15"
      (markingEvent)="onMarking($event)">
  </spotfire-viewer>`
})
export class AppComponent {
  url       = 'https://spotfire-next.cloud.tibco.com';
  path      = 'Samples/Sales and Marketing';
  cust      = { showAuthor: true, showFilterPanel: true, showToolBar: true };
  mon       = { SalesAndMarketing: ['*'] };
  onMarking = (e: Event) => console.log('[AppComponent] MARKING returns', e);
}

@NgModule({
  imports:      [ BrowserModule, SpotfireViewerModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule {}
```


The package provides two modules and two components:
 * `SpotfireViewerModule` exports `SpotfireViewerComponent`
 * `SpotfireEditorModule` depends on `SpotfireViewerModule` and exports `SpotfireEditorComponent`


---
User can also extend `SpotfireViewerComponent` like this : 

```typescript
@Component({
  selector: 'my-spotfire',
  template: `Override spotfire-viewer template:
  <button *ngFor="let p of ['Sales performance', 'Territory analysis', 'Effect of promotions']" (click)="openPage(p)">{{p}}</button>
  <div class="mys" #spot></div>`,
  styles: [`
  div.mys { width:600px; height:400px; background:#ebebeb; border-radius: 20px}
  button { padding:10px }
`]
})
class MySpotfireViewerComponent extends SpotfireViewerComponent implements OnInit {
  // No var please (or set a contructor)
  ngOnInit(): void {
    this.url = 'https://spotfire-next.cloud.tibco.com';
    this.path = 'Samples/Sales and Marketing';
    this.customization = { showAuthor: true, showFilterPanel: true, showToolBar: true } as SpotfireCustomization;
    this.markingOn = '{"SalesAndMarketing": ["*"]}';

    // Show default page:
    this.display();

    // Subscribe to markingEvent
    //
    this.markingEvent.subscribe(e => console.log('MARKING MySpot', e));
  }
}
```

---
## Further help

Use Slack or email to send me any question, suggestion or concern you have 

Nicolas Deroche - part of **The Tibco Company**