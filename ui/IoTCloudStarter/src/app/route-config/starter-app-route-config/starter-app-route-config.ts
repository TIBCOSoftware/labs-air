import {HomeComponent} from '../../routes/home/home.component';
import {IotGatewayComponent} from '../../components/iot-gateway/iot-gateway.component';
import {IotGatewaySubscriptionComponent} from '../../components/iot-gateway-subscription/iot-gateway-subscription.component';
import {IotDeviceComponent} from '../../components/iot-device/iot-device.component';
import {IotDeviceCommandComponent} from '../../components/iot-device-command/iot-device-command.component';
import {IotDeviceDashboardComponent} from '../../components/iot-device-dashboard/iot-device-dashboard.component';
import {IotGatewayDashboardComponent} from '../../components/iot-gateway-dashboard/iot-gateway-dashboard.component';
import {IotDeviceStreamComponent} from '../../components/iot-device-stream/iot-device-stream.component';
import {IotDashboardComponent} from '../../components/iot-dashboard/iot-dashboard.component';
import {
  AuthGuard,
  ConfigurationMenuConfigResolver,
  GeneralConfigResolver,
  GeneralLandingPageConfigResolver,
} from '@tibco-tcstk/tc-core-lib';
import {
  AccessResolver,
  CaseGuard,
  ClaimsResolver,
  GroupsResolver,
  LaConfigResolver,
  LiveAppsConfigResolver,
  RoleGuard,
  RolesResolver
} from '@tibco-tcstk/tc-liveapps-lib';
import {SplashComponent} from '../../routes/splash/splash.component';
import {CaseComponent} from '../../routes/case/case.component';
import {ConfigurationComponent} from '../../routes/configuration/configuration.component';
import {CONFIGURATION_ROUTE_CONFIG, CONFIGURATION_ROUTE_PROVIDERS } from './configuration-route-config/configuration-route-config';
import {CustomFormDefs, FormResolver} from '@tibco-tcstk/tc-forms-lib';

export const HOME_ROUTE = 'splash';

export const STARTER_APP_ROUTES =
[
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
      customFormDefs: FormResolver
    },
    children: [
      {
        path: 'iotdashboard',
        component: IotDashboardComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          laConfigHolder: LaConfigResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          access: AccessResolver,
          customFormDefs: FormResolver
        }
      },
      {
        path: 'gateway',
        component: IotGatewayComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          laConfigHolder: LaConfigResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          access: AccessResolver,
          customFormDefs: FormResolver
        }
      },
      {
        path: 'gatewaydashboard',
        component: IotGatewayDashboardComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          laConfigHolder: LaConfigResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          access: AccessResolver,
          customFormDefs: FormResolver
        }
      },
      {
        path: 'gatewaysubscription/:gatewayId',
        component: IotGatewaySubscriptionComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          laConfigHolder: LaConfigResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          access: AccessResolver,
          customFormDefs: FormResolver
        }
      },
      {
        path: 'device',
        component: IotDeviceComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          laConfigHolder: LaConfigResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          access: AccessResolver,
          customFormDefs: FormResolver
        }
      },
      {
        path: 'devicecommand',
        component: IotDeviceCommandComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          laConfigHolder: LaConfigResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          access: AccessResolver,
          customFormDefs: FormResolver
        }
      },
      {
        path: 'devicedashboard',
        component: IotDeviceDashboardComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          laConfigHolder: LaConfigResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          access: AccessResolver,
          customFormDefs: FormResolver
        }
      },
      {
        path: 'devicestream',
        component: IotDeviceStreamComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          laConfigHolder: LaConfigResolver,
          groups: GroupsResolver,
          roles: RolesResolver,
          access: AccessResolver,
          customFormDefs: FormResolver
        }
      },
      {
        path: '', redirectTo: '/starterApp/home/gateway', pathMatch: 'full'
      },
      {
        path: '**', redirectTo: '/starterApp/home/gateway'
      }
    ]
  },
  {
    path: 'splash',
    component: SplashComponent,
    canActivate: [AuthGuard],
    resolve: {
        landingPagesConfigHolder: GeneralLandingPageConfigResolver
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
      access: AccessResolver,
      customFormDefs: FormResolver
    }
  },
  {
    path: 'configuration', component: ConfigurationComponent, canActivate: [AuthGuard, RoleGuard],
    resolve: {configurationMenuHolder: ConfigurationMenuConfigResolver},
    children: CONFIGURATION_ROUTE_CONFIG
  },
  {
    path: '', redirectTo: '/starterApp/home/gateway', pathMatch: 'full'
  },
  {
    path: '**', redirectTo: '/starterApp/home'
  }
];

export const STARTER_APP_PROVIDERS = [
  [
  ClaimsResolver,
  LiveAppsConfigResolver,
  LaConfigResolver,
  GeneralConfigResolver,
  ConfigurationMenuConfigResolver,
  RolesResolver,
  GroupsResolver,
  AccessResolver,
  FormResolver,
  GeneralLandingPageConfigResolver
  ],
  CONFIGURATION_ROUTE_PROVIDERS
];

