import { Component, OnInit } from '@angular/core';
import { SpotfireCustomization} from '@tibco/spotfire-wrapper';

@Component({
  selector: 'app-iot-gateway-dashboard',
  templateUrl: './iot-gateway-dashboard.component.html',
  styleUrls: ['./iot-gateway-dashboard.component.css']
})
export class IotGatewayDashboardComponent implements OnInit {
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
  
    public marking(data) {
      console.log("marking: ", data)
    }

}
