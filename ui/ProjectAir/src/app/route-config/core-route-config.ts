import {LoginComponent} from '../routes/login/login.component';
import {
  AuthGuard,
  GeneralConfigResolver,
  LoginPrefillResolver,
  TibcoCloudErrorComponent,
} from '@tibco-tcstk/tc-core-lib';
import {StarterAppComponent} from '../routes/starter-app/starter-app.component';
import {
  ClaimsResolver,
} from '@tibco-tcstk/tc-liveapps-lib';
import {STARTER_APP_ROUTES, STARTER_APP_PROVIDERS, HOME_ROUTE } from './starter-app-route-config/starter-app-route-config';

export const CORE_ROUTES = [
      {
        path: 'login',
        component: LoginComponent,
        resolve: {
          loginPrefill: LoginPrefillResolver
        }
      },
      {
        path: 'errorHandler/:errorCode/:errorData',
        component: TibcoCloudErrorComponent
      },
      {
        // starterApp only provides the global nav bar at present - but will be a useful place to do stuff that applies to all routes
        // Note: although each route uses claimsResolver this doesnt actually result in multiple REST call to claims
        // because we cache at http level using an interceptor
        path: 'starterApp',
        component: StarterAppComponent,
        canActivate: [AuthGuard],
        resolve: {
          claims: ClaimsResolver,
          config: GeneralConfigResolver
        },
        children: STARTER_APP_ROUTES
      },
      {
        path: '', redirectTo: '/starterApp/' + HOME_ROUTE, pathMatch: 'full'
      },
      {
        path: '**', redirectTo: '/starterApp/' + HOME_ROUTE
      }
    ];

export const CORE_PROVIDERS = [
  [
  LoginPrefillResolver,
  ClaimsResolver,
  GeneralConfigResolver
  ],
  STARTER_APP_PROVIDERS
];
