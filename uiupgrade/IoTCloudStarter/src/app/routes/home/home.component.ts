import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GeneralConfig, UiAppConfig, RouteAction, Claim} from '@tibco-tcstk/tc-core-lib';
import {CaseRoute, CaseType, LiveAppsConfig, Groups, Roles, RouteAccessControlConfig} from '@tibco-tcstk/tc-liveapps-lib';
import {CustomFormDefs} from '@tibco-tcstk/tc-forms-lib';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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

  ngOnInit() {
    // each route uses a resolver to get required data for any components it uses
    // For example here the general config and liveAppsConfig is read from this.route.snapshot.data.laConfigHolder
    // it was populated by LaConfigResolver (wraps generalConfig resolver and liveAppsConfig resolver)
    // *****
    // starter-app-route-config.ts:
    // {
    //     path: 'home',
    //     component: HomeComponent,
    //     canActivate: [AuthGuard],
    //     resolve: {
    //       claims: ClaimsResolver,
    //  -->  laConfigHolder: LaConfigResolver, <--    *laConfigHolder* is this.route.snapshot.data.laConfigHolder below
    //       groups: GroupsResolver,
    //       roles: RolesResolver
    //     }
    //   }
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
    // this.welcomeMessage = this.generalConfig.welcomeMessage ? this.generalConfig.welcomeMessage : 'Welcome to Case Manager';
    this.welcomeMessage = 'IOT Management';
  }

}
