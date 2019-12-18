import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppComponent } from './app.component';
import {TcLiveappsLibModule} from '@tibco-tcstk/tc-liveapps-lib';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from './material.module';
import {LogService, TcCoreLibModule} from '@tibco-tcstk/tc-core-lib';
import {TcFormsLibModule} from '@tibco-tcstk/tc-forms-lib';
import {LoginComponent} from './routes/login/login.component';
import {HomeComponent} from './routes/home/home.component';
import {StarterAppComponent} from './routes/starter-app/starter-app.component';
import {CaseComponent} from './routes/case/case.component';
import { ConfigurationComponent } from './routes/configuration/configuration.component';
import { SplashComponent } from './routes/splash/splash.component';
import { AppRoutingModule } from './app-routing.module';
import { IotHomeCockpitComponent } from './components/iot-home-cockpit/iot-home-cockpit.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { ChartsModule } from 'ng2-charts';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { IotGatewayComponent } from './components/iot-gateway/iot-gateway.component';
import { IotDeviceComponent } from './components/iot-device/iot-device.component';
import { IotDeviceStreamComponent } from './components/iot-device-stream/iot-device-stream.component';
import { IotDeviceCommandComponent } from './components/iot-device-command/iot-device-command.component';
import { IotGatewaySubscriptionComponent } from './components/iot-gateway-subscription/iot-gateway-subscription.component';
import { IotDeviceDashboardComponent } from './components/iot-device-dashboard/iot-device-dashboard.component';
import { SpotfireViewerModule } from '@tibco/spotfire-wrapper';
import { IotDashboardComponent } from './components/iot-dashboard/iot-dashboard.component';
import { SpotfireDashboardComponent } from './components/spotfire-dashboard/spotfire-dashboard.component';
import { IotGatewayDashboardComponent } from './components/iot-gateway-dashboard/iot-gateway-dashboard.component';
import { IotDeviceProfileComponent } from './components/iot-device-profile/iot-device-profile.component';
import { IotDeviceProvisionComponent } from './components/iot-device-provision/iot-device-provision.component';
import { IotRulesComponent } from './components/iot-rules/iot-rules.component';
import { IotNotificationsComponent } from './components/iot-notifications/iot-notifications.component';
import { HttpClientModule } from "@angular/common/http";
import { MaporamaComponent } from './components/maporama/maporama.component';
import { TceRulesComponent } from './components/tce-rules/tce-rules.component';
import { IotDeviceSummaryComponent } from './components/iot-device-summary/iot-device-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    StarterAppComponent,
    HomeComponent,
    CaseComponent,
    ConfigurationComponent,
    SplashComponent,
    IotHomeCockpitComponent,
    NavBarComponent,
    IotGatewayComponent,
    IotDeviceComponent,
    IotDeviceStreamComponent,
    IotDeviceCommandComponent,
    IotDeviceDashboardComponent,
    IotGatewaySubscriptionComponent,
    SpotfireDashboardComponent,
    IotDashboardComponent,
    IotGatewayDashboardComponent,
    IotDeviceProfileComponent,
    IotDeviceProvisionComponent,
    IotRulesComponent,
    IotNotificationsComponent,
    MaporamaComponent,
    TceRulesComponent,
    IotDeviceSummaryComponent
  ],
  imports: [
    AppRoutingModule,
    TcCoreLibModule,
    TcFormsLibModule,
    TcLiveappsLibModule.forRoot(),
    FlexLayoutModule,
    BrowserModule,
    FormsModule,
    ChartsModule,
    Ng2GoogleChartsModule,
    MaterialModule,
    ReactiveFormsModule,
    SpotfireViewerModule,
    HttpClientModule
  ],
  providers: [
    LogService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
