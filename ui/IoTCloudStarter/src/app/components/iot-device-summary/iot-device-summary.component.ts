import { Component, Input, ElementRef, ViewChild, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

import { Device, TSReading, Resource, Gateway } from '../../shared/models/iot.model';
import { DgraphService } from '../../services/graph/dgraph.service';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-iot-device-summary',
  templateUrl: './iot-device-summary.component.html',
  styleUrls: ['./iot-device-summary.component.css']
})
export class IotDeviceSummaryComponent implements OnInit, OnDestroy {

  @Input() config: Device;

  subscription: Subscription;
  source = interval(5000);
  subscribed = false;

  showLabelResource1 = false;
  showLabelResource2 = false;
  showLabelResource3 = false;
  showImageResource1 = false;
  showImageResource2 = false;
  showImageResource3 = false;
  showGaugeResource1 = false;
  showGaugeResource2 = false;
  showGaugeResource3 = false;

  imageName1 = "Fault";
  imageName2 = "Fault";
  imageName3 = "Fault";

  buttonLabel1 = "";
  buttonLabel2 = "";
  buttonLabel3 = "";

  gaugeHeight = 150;

  public gaugeChartData1: GoogleChartInterface = {
    chartType: 'Gauge',
    dataTable: [
      ['Label', 'Value'],
      ['Voltage', 220]
    ],
    options: {
      animation: { easing: 'out' },
      height: 150,
      // redFrom: 300, redTo: 360,
      // yellowFrom: 260, yellowTo: 300,
      minorTicks: 5,
      min: 0, max: 360,
      greenColor: '#d0e9c6'
    }
  };

  public gaugeChartData2: GoogleChartInterface = {
    chartType: 'Gauge',
    dataTable: [
      ['Label', 'Value'],
      ['Current', 30]
    ],
    options: {
      animation: { easing: 'out' },
      height: 150,
      // redFrom: 90, redTo: 100,
      // yellowFrom: 75, yellowTo: 90,
      minorTicks: 5,
      min: 0, max: 100,
      greenColor: '#d0e9c6'
    }
  };

  public gaugeChartData3: GoogleChartInterface = {
    chartType: 'Gauge',
    dataTable: [
      ['Label', 'Value'],
      ['Current', 30]
    ],
    options: {
      animation: { easing: 'out' },
      height: 150,
      // redFrom: 90, redTo: 100,
      // yellowFrom: 75, yellowTo: 90,
      minorTicks: 5,
      min: 0, max: 100,
      greenColor: '#d0e9c6'
    }
  };

  constructor(private graphService: DgraphService) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    console.log("DeviceSummary ngOnDestroy");

    if (this.subscribed) {
      this.subscription.unsubscribe();
      this.subscribed = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "config" changed
    if (changes['config']) {
      console.log("On summary details ngOnChanges: ", this.config);

      if (this.subscribed) {
        this.subscription.unsubscribe();
        this.subscribed = false;
      }

      this.showImageResource1 = false;
      this.showImageResource2 = false;
      this.showImageResource3 = false;
      this.showGaugeResource1 = false;
      this.showGaugeResource2 = false;
      this.showGaugeResource3 = false;
      this.showLabelResource1 = false;
      this.showLabelResource2 = false;
      this.showLabelResource3 = false;

      this.getReadings();

      this.subscription = this.source.subscribe(val => this.getReadings());
      this.subscribed = true;

    }
  }

  getReadings() {

    this.graphService.getLastReadingsForDevice(this.config.name)
      .subscribe(res => {

        console.log("Received last reading; ", res);

        this.setVisualization(res);
      })
  }

  setVisualization(readings) {

    let currentImageIdx = 1;
    let currentGaugeIdx = 1;
    let currentButtonIdx = 1;
    // For each resource
    readings.forEach(reading => {
      console.log("Resource: ", reading.name);

      let resource = this.getResourceDetail(reading.name);

      console.log("Resource detail for reading: ", resource);


      let resourceType = resource.properties.value.type;
      console.log("Resource type: ", resourceType);
      if (resourceType == "String" || resourceType == "BOOL") {
        console.log("Processing string resource");

        let useImage = (resource.attributes != undefined && resource.attributes.Visualization != undefined);

        // Use image.  Image name is the name of the resource stripped of blanks
        if (useImage) {
          if (currentImageIdx == 1) {
            this.imageName1 = reading.value.replace(/\s/g, "");
            this.showImageResource1 = true;
            console.log("Setting image1 to: ", this.imageName1);

          }
          else if (currentImageIdx == 2) {
            this.imageName2 = reading.value.replace(/\s/g, "");
            this.showImageResource2 = true;
            console.log("Setting image1 to: ", this.imageName1);
          }
          else if (currentImageIdx == 3) {
            this.imageName3 = reading.value.replace(/\s/g, "");
            this.showImageResource3 = true;
            console.log("Setting image1 to: ", this.imageName1);
          }
          currentImageIdx++;
        }
        // Use label
        else {
          if (currentButtonIdx == 1) {
            this.buttonLabel1 = resource.name + ":\n" + reading.value;
            this.showLabelResource1 = true;
          } else if (currentButtonIdx == 2) {
            this.buttonLabel2 = resource.name + ":\n" + reading.value;
            this.showLabelResource2 = true;
          } else if (currentButtonIdx == 3) {
            this.buttonLabel3 = resource.name + ":\n" + reading.value;
            this.showLabelResource3 = true;
          }
          currentButtonIdx++;
        }


      }
      // Handle numeric values.
      else {

        let value = +reading.value;

        if (!isNaN(value)) {
          console.log("Processing numeric resource");

          let minVal = 0;
          let maxVal = 100;

          if (resource.properties.value.minimum != undefined) {
            minVal = +resource.properties.value.minimum;
          }

          if (resource.properties.value.maximum != undefined) {
            maxVal = +resource.properties.value.maximum;
          }

          let options = {
            height: this.gaugeHeight,
            minorTicks: 5,
            min: minVal,
            max: maxVal
          }

          if (currentGaugeIdx == 1) {

            let ccComponent = this.gaugeChartData1.component;

            this.gaugeChartData1.dataTable = [];
            this.gaugeChartData1.dataTable.push(['Label', 'Value']);
            this.gaugeChartData1.dataTable.push([reading.name, value]);

            this.gaugeChartData1.options = options;

            console.log("the options values are: ", this.gaugeChartData1.options);


            this.showGaugeResource1 = true;

            ccComponent.draw();

          }
          else if (currentGaugeIdx == 2) {

            let ccComponent = this.gaugeChartData2.component;

            this.gaugeChartData2.dataTable = [];
            this.gaugeChartData2.dataTable.push(['Label', 'Value']);
            this.gaugeChartData2.dataTable.push([reading.name, value]);

            this.gaugeChartData2.options = options;

            this.showGaugeResource2 = true;

            ccComponent.draw();

          }
          else if (currentGaugeIdx == 3) {

            let ccComponent = this.gaugeChartData3.component;

            this.gaugeChartData3.dataTable = [];
            this.gaugeChartData3.dataTable.push(['Label', 'Value']);
            this.gaugeChartData3.dataTable.push([reading.name, value]);

            this.gaugeChartData3.options = options;

            this.showGaugeResource3 = true;

            ccComponent.draw();

          }
          currentGaugeIdx++;

        }

      }


    }
    );


  }

  getResourceDetail(resourceName): Resource {
    let deviceResource = null;

    let len = this.config.profile.deviceResources.length;

    for (let i = 0; i < len && deviceResource == null; i++) {
      if (resourceName == this.config.profile.deviceResources[i].name) {
        deviceResource = this.config.profile.deviceResources[i];
      }
    }

    return deviceResource;
  }
}
