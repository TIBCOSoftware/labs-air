import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LiveAppsService} from '@tibco-tcstk/tc-liveapps-lib';
import {GeneralConfig} from '@tibco-tcstk/tc-core-lib';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-starter-app',
  templateUrl: './starter-app.component.html',
  styleUrls: ['./starter-app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class StarterAppComponent implements OnInit {

  public config: GeneralConfig;

  constructor(private route: ActivatedRoute, private router: Router, private titleService: Title) { }

  ngOnInit() {
    // each route uses a resolver to get required data for any components it uses
    // For example here the general config is read from this.route.snapshot.data.config
    // That config is available because the starterApp route ran the GeneralConfigResolver when defined in case-route-config.ts
    // *****
    // case-route-config.ts:
    // path: 'starterApp',
    //         component: StarterAppComponent,
    //         canActivate: [AuthGuard],
    //         resolve: {
    //           claims: ClaimsResolver,
    //       --> config: GeneralConfigResolver  <--    *config* is this.route.snapshot.data.config below
    //         },
    //         children: STARTER_APP_ROUTES

    this.config = this.route.snapshot.data.config;
    this.titleService.setTitle(this.config.browserTitle ? this.config.browserTitle : 'Tibco Cloud Starters');
  }

}
