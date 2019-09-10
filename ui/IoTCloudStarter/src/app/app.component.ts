import { Component } from '@angular/core';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tcstk-case-manager-app';

  constructor(private logger: LogService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {

    logger.level = LogLevel.Debug;
    logger.info('My Cloud Starter Online...');

    // Register Icons
    this.matIconRegistry.addSvgIcon(
      "command",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/command.svg"));
    this.matIconRegistry.addSvgIcon(
      "devicedashboard",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/dashboard.svg"));
    this.matIconRegistry.addSvgIcon(
      "device",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/device.svg"));
    this.matIconRegistry.addSvgIcon(
      "gatewaydashboard",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/gateway_dashboard.svg"));
    this.matIconRegistry.addSvgIcon(
      "gatewaylocation",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/gateway_location.svg"));
    this.matIconRegistry.addSvgIcon(
      "gateway",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/gateway.svg"));
    this.matIconRegistry.addSvgIcon(
      "instrumenthistory",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/instrument_history.svg"));
    this.matIconRegistry.addSvgIcon(
      "instrumentstreaming",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/instrument_streaming.svg"));
    this.matIconRegistry.addSvgIcon(
      "iotdashboard",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/iot_dashboard.svg"));
    this.matIconRegistry.addSvgIcon(
      "provisioning",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/provisioning.svg"));
    this.matIconRegistry.addSvgIcon(
      "rules",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/rules.svg"));
  }
}
