import { Component, OnInit } from '@angular/core';
import { SpotfireCustomization } from '@tibco/spotfire-wrapper';

@Component({
  selector: 'app-iot-device-dashboard',
  templateUrl: './iot-device-dashboard.component.html',
  styleUrls: ['./iot-device-dashboard.component.css']
})
export class IotDeviceDashboardComponent implements OnInit {
  // Spotfire configuration
  public spotfireServer: string;
  public analysisPath: string;
  public allowedPages: string[];
  public activePage: string;
  public markingOn = {};
  public markingName: string;
  public parameters: string;
  public configuration: SpotfireCustomization;

  constructor() { }

  ngOnInit() {
    this.spotfireServer = 'https://spotfire-next.cloud.tibco.com';
    this.analysisPath = '/Users/vioijfozulumlardrxcikq7xtczlfcrk/Public/Autoencoder_v5';
    this.activePage = '0';
    this.parameters = "Test";
    this.allowedPages = ['Tab1', 'Tab2', 'Tab3'];
    this.configuration = {
      showAbout: false,
      showAnalysisInformationTool: false,
      showAuthor: false,
      showClose: false,
      showCustomizableHeader: false,
      showDodPanel: false,
      showExportFile: false,
      showFilterPanel: true,
      showHelp: false,
      showLogout: false,
      showPageNavigation: true,
      showReloadAnalysis: false,
      showStatusBar: false,
      showToolBar: false,
      showUndoRedo: false
    };

  }

  public tabChange = ($event: any): void => {
    // this.spotfireWrapperComponent.openPage(this.allowedPages[$event.index]);
  }

  public marking(data) {
    console.log("marking: ", data)
  }
}
