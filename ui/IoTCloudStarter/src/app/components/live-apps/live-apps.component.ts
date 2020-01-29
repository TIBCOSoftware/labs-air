import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';


import { ActivatedRoute, Router } from '@angular/router';
import { GeneralConfig, UiAppConfig, RouteAction, Claim } from '@tibco-tcstk/tc-core-lib';
import {
  CaseRoute, CaseType, LiveAppsConfig, Groups, Roles, RouteAccessControlConfig, CaseTypeReportRecord, CaseTypeStateReportStateInfo,
  LiveAppsFavoriteCasesComponent, LiveAppsRecentCasesComponent, LiveAppsSearchWidgetComponent, LiveAppsNotesComponent,
  LiveAppsDocumentsComponent, LiveAppsActiveCasesWidgetComponent, LiveAppsWorkitemsComponent
} from '@tibco-tcstk/tc-liveapps-lib';
import { CustomFormDefs } from '@tibco-tcstk/tc-forms-lib';


@Component({
  selector: 'app-live-apps',
  templateUrl: './live-apps.component.html',
  styleUrls: ['./live-apps.component.css']
})
export class LiveAppsComponent implements OnInit {

  public generalConfig: GeneralConfig;
  public liveAppsConfig: LiveAppsConfig;
  private claims: Claim;
  public sandboxId: number;
  public selectedAppConfig: CaseType;
  public userName: string;
  public userId: string;
  public email: string;
  public groups: Groups;
  public roles: Roles;
  public access: RouteAccessControlConfig;
  public customFormDefs: CustomFormDefs;
  public welcomeMessage: string;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {

    this.generalConfig = this.route.snapshot.data.laConfigHolder.generalConfig;
    this.liveAppsConfig = this.route.snapshot.data.laConfigHolder.liveAppsConfig;
    this.claims = this.route.snapshot.data.claims;
    this.groups = this.route.snapshot.data.groups;
    this.roles = this.route.snapshot.data.roles;
    this.access = this.route.snapshot.data.access;
    this.sandboxId = this.route.snapshot.data.claims.primaryProductionSandbox.id;
    this.customFormDefs = this.route.snapshot.data.customFormDefs;
    this.userName = this.claims.firstName + ' ' + this.claims.lastName;
    this.email = this.claims.email;
    this.userId = this.claims.id;
    this.welcomeMessage = this.generalConfig.welcomeMessage ? this.generalConfig.welcomeMessage : 'Welcome to Case Manager';

    console.log("generalConfig: " + this.generalConfig);
    console.log("liveAppsConfig: " + this.liveAppsConfig);
    console.log("claims: " + this.claims);

    console.log("UserName: " + this.userName);

    console.log("userId: " + this.userId);
    console.log("email: " + this.email);
    console.log("sandboxId: " + this.sandboxId);

  }

  // Components used by this route can output a route action using an event emitter
  // This handler will fire on these events and navigate to the appropriate route

  handleRouteAction = (routeAction: RouteAction) => {
    if (routeAction.action === 'caseClicked') {
      const caseRoute = new CaseRoute().deserialize(routeAction.context);
      // case clicked - navigate to case - note need to pass appId and caseId
      this.router.navigate(['/starterApp/case/' + caseRoute.appId + '/' + caseRoute.typeId + '/' + caseRoute.caseRef]);
    }
    if (routeAction.action === 'configClicked') {
      // config clicked route to config page
      this.router.navigate(['/starterApp/configuration/']);
    }

  }


}
