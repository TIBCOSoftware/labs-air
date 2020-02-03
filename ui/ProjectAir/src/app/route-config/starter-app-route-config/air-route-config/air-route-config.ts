import { GeneralConfigResolver, AuthGuard } from '@tibco-tcstk/tc-core-lib';
import {
    ClaimsResolver, LaConfigResolver,
    RolesResolver, GroupsResolver, CaseGuard, CaseDataResolver, FormConfigResolver, AccessResolver
} from '@tibco-tcstk/tc-liveapps-lib';
import { FormResolver } from '@tibco-tcstk/tc-forms-lib';
import { HomeComponent } from 'src/app/routes/home/home.component';
import { CaseComponent } from 'src/app/routes/case/case.component';

export const AIR_ROUTE_CONFIG = [
    // {
    //     path: "process-mining-view",
    //     component: PdProcessMiningComponent,
    //     // canActivate: [SelectedRoleGuard],
    //     resolve: {
    //         // claims: ClaimsResolver,
    //         // laConfigHolder: LaConfigResolver,
    //         // processDiscoverConfigHolder: ProcessDiscoveryConfigResolver,
    //         spotfireConfigHolder: SpotfireConfigResolver,
    //         // rolesHolder: RolesResolver,
    //         // groupsHolder: GroupsResolver
    //     }
    // },
    // {
    //     path: "case-view",
    //     component: PdCaseViewComponent,
    //     // canActivate: [SelectedRoleGuard],
    //     resolve: {
    //         claims: ClaimsResolver,
    //         laConfigHolder: LaConfigResolver,
    //         rolesHolder: RolesResolver,
    //         groupsHolder: GroupsResolver,

    //     }
    // },
    // {
    //     path: 'case/:appId/:typeId/:caseRef',
    //     component: PdCaseComponent,
    //     canActivate: [AuthGuard, CaseGuard],
    //     resolve: {
    //         laConfigHolder: LaConfigResolver,
    //         spotfireConfigHolder: SpotfireConfigResolver,
    //         claims: ClaimsResolver,
    //         groups: GroupsResolver,
    //         roles: RolesResolver,
    //         caseDataHolder: CaseDataResolver,
    //         customFormDefs: FormResolver,
    //         formConfig: FormConfigResolver
    //     }
    // },
    // {
    //     path: "business-processes",
    //     component: PdDatasourcesAdministrationComponent,
    //     // canActivate: [SelectedRoleGuard],
    //     resolve: {
    //         claims: ClaimsResolver,
    //         processDiscovery: ProcessDiscoveryConfigResolver
    //     }
    // },
    // {
    //     path: "new-datasource",
    //     component: PdNewBusinessProcessComponent,
    //     resolve: {
    //         claims: ClaimsResolver,
    //         processDiscovery: ProcessDiscoveryConfigResolver
    //     }
    // },
    // {
    //     path: 'datasource/case/:appId/:typeId/:caseRef',
    //     component: PdDatasourceCaseComponent,
    //     canActivate: [AuthGuard, CaseGuard],
    //     resolve: {
    //         laConfigHolder: LaConfigResolver,
    //         claims: ClaimsResolver,
    //         groups: GroupsResolver,
    //         roles: RolesResolver,
    //         customFormDefs: FormResolver,
    //         // access: AccessResolver
    //         formConfig: FormConfigResolver
    //     }
    // },
    // {
    //     path: "file-management",
    //     component: PdFileManagementComponent,
    //     resolve: {
    //         claims: ClaimsResolver,
    //         generalConfigHolder: GeneralConfigResolver
    //     }
    // },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    resolve: {
      claims: ClaimsResolver,
      laConfigHolder: LaConfigResolver,
      groups: GroupsResolver,
      roles: RolesResolver,
      access: AccessResolver,
      customFormDefs: FormResolver,
      formConfig: FormConfigResolver
    }
  },
  {
      path: 'case/:appId/:typeId/:caseRef',
      component: CaseComponent,
      canActivate: [AuthGuard, CaseGuard],
      resolve: {
          laConfigHolder: LaConfigResolver,
          claims: ClaimsResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          caseDataHolder: CaseDataResolver,
          customFormDefs: FormResolver,
          formConfig: FormConfigResolver
      }
  },
  {
      path: '**',
      redirectTo: '/starterApp/case-view'
  }
];

export const AIR_ROUTE_PROVIDERS = [
  ClaimsResolver,
  LaConfigResolver,
  GroupsResolver,
  RolesResolver,
  AccessResolver,
  FormResolver,
  FormConfigResolver,
  CaseDataResolver
]
