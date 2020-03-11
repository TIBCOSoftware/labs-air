import { Component, OnInit } from '@angular/core';
import { SpotfireCustomization } from '@tibco/spotfire-wrapper';

import { SpotfireDashboardComponent } from '../spotfire-dashboard/spotfire-dashboard.component';

@Component({
  selector: 'app-iot-dashboard',
  templateUrl: './iot-dashboard.component.html',
  styleUrls: ['./iot-dashboard.component.css']
})
export class IotDashboardComponent implements OnInit {

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
    // this.spotfireServer = 'https://spotfire-next.cloud.tibco.com';
    // this.analysisPath = '/Samples/Introduction to Spotfire';
    // this.activePage = '0';
    // this.parameters = "Test";
    // this.configuration = {
    //   showAbout: false,
    //   showAnalysisInformationTool: false,
    //   showAuthor: false,
    //   showClose: false,
    //   showCustomizableHeader: false,
    //   showDodPanel: false,
    //   showExportFile: false,
    //   showFilterPanel: true,
    //   showHelp: false,
    //   showLogout: false,
    //   showPageNavigation: true,
    //   showReloadAnalysis: false,
    //   showStatusBar: false,
    //   showToolBar: false,
    //   showUndoRedo: false
    // };

    // https://spotfire-next.cloud.tibco.com/spotfire/wp/analysis?file=/Users/b5zl5zgs2jshn2xyyess4gzqufcuue6q/Public/Product%20Registration%2006


    this.spotfireServer = 'https://spotfire-next.cloud.tibco.com';
    this.analysisPath = '/Users/b5zl5zgs2jshn2xyyess4gzqufcuue6q/Public/Product Registration 06';
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
