import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CORE_PROVIDERS, CORE_ROUTES} from './route-config/core-route-config';

@NgModule({
  // hash routing
//   imports: [RouterModule.forRoot(CORE_ROUTES, { useHash: true })],
  // non-hash routing
  imports: [RouterModule.forRoot(CORE_ROUTES)],
  exports: [RouterModule],
  providers: CORE_PROVIDERS
})

export class AppRoutingModule {
}

