import { Component, OnInit } from '@angular/core';
import { SpotfireViewerComponent, SpotfireCustomization} from '@tibco/spotfire-wrapper';

@Component({
  selector: 'app-spotfire-dashboard',
  templateUrl: './spotfire-dashboard.component.html',
  styleUrls: ['./spotfire-dashboard.component.css']
})
export class SpotfireDashboardComponent extends SpotfireViewerComponent implements OnInit {

  // No var please (or set a contructor)
  ngOnInit(): void {

    console.log('Inside IotDeviceDashboardComponent');
    // this.url = 'https://spotfire-next.cloud.tibco.com';
    // this.path = 'Samples/Sales and Marketing';
    // this.path = '/Users/vioijfozulumlardrxcikq7xtczlfcrk/Public/Autoencoder_v5';
    // this.path = '/Samples/Introduction to Spotfire';
    // this.customization = { showAuthor: true, showFilterPanel: true, showToolBar: false } as SpotfireCustomization;
    // this.markingOn = '{"SalesAndMarketing": ["*"]}';

    // Show default page:
    this.display();

    // Subscribe to markingEvent
    //
    this.markingEvent.subscribe(e => console.log('MARKING MySpot', e));
  }
  
}
