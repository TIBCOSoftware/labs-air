import {GeneralConfigResolver, TibcoCloudSettingsGeneralComponent, TibcoCloudSettingLandingComponent, GeneralLandingPageConfigResolver} from '@tibco-tcstk/tc-core-lib';
import {
  AllGroupsResolver,
  AllRolesResolver,
  ClaimsResolver, LaConfigResolver,
  LiveAppsSettingsComponent, LiveAppsSettingsRecentCasesComponent,
  LiveAppsSettingsRolesComponent, LiveAppsSettingsSummaryCardsComponent
} from '@tibco-tcstk/tc-liveapps-lib';

export const CONFIGURATION_ROUTE_CONFIG = [
  {
    path: 'general-application-settings',
    component: TibcoCloudSettingsGeneralComponent,
    resolve: {
      generalConfigHolder: GeneralConfigResolver,
      claims: ClaimsResolver
    }
  },
  {
    path: 'general-application-roles',
    component: LiveAppsSettingsRolesComponent,
    resolve: {
      generalConfigHolder: GeneralConfigResolver,
      claims: ClaimsResolver,
      allRoles: AllRolesResolver,
      allGroups: AllGroupsResolver
    }
  },
  {
    path: "general-application-landing-page",
    component: TibcoCloudSettingLandingComponent,
    resolve: {
      landingPagesConfigHolder: GeneralLandingPageConfigResolver,
      claims: ClaimsResolver,
      allRolesHolder: AllRolesResolver
    }
  },
  {
    path: 'live-apps-app-selection',
    component: LiveAppsSettingsComponent,
    resolve: {
      claims: ClaimsResolver,
      laConfigHolder: LaConfigResolver,
      generalConfigHolder: GeneralConfigResolver
    }
  },
  {
    path: 'live-apps-recent-cases',
    component: LiveAppsSettingsRecentCasesComponent,
    resolve: {
      claims: ClaimsResolver,
      laConfigHolder: LaConfigResolver,
      generalConfigHolder: GeneralConfigResolver
    }
  },
  {
    path: 'live-apps-summary-cards',
    component: LiveAppsSettingsSummaryCardsComponent,
    resolve: {
      claims: ClaimsResolver,
      laConfigHolder: LaConfigResolver,
      generalConfigHolder: GeneralConfigResolver
    }
  },
  {
    path: '', redirectTo: '/starterApp/configuration/general-application-settings', pathMatch: 'full'
  },
  {
    path: '**', redirectTo: '/starterApp/configuration/general-application-settings'
  }
];

export const CONFIGURATION_ROUTE_PROVIDERS = [
  GeneralConfigResolver,
  ClaimsResolver,
  AllRolesResolver,
  AllGroupsResolver,
  GeneralLandingPageConfigResolver
]
