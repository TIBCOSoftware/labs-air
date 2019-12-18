import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { SelectionModel } from '@angular/cdk/collections';

import { Device, TSReading, Resource, Gateway } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { DgraphService } from '../../services/graph/dgraph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
//import { merge } from "rxjs/observable/merge";
//import { fromEvent } from 'rxjs/observable/fromEvent';
import { interval, Subscription } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource, MatDatepickerInputEvent } from '@angular/material';

import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';


import { BaseChartDirective, defaultColors, Label, MultiDataSet, SingleDataSet } from 'ng2-charts';
import { ChartType } from 'chart.js';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import 'chartjs-plugin-streaming';


@Component({
  selector: 'app-iot-device',
  templateUrl: './iot-device.component.html',
  styleUrls: ['./iot-device.component.css']
})
export class IotDeviceComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription;
  source = interval(5000);
  subscribed = false;
  createMapFlag = true;  // Variable indicating if map needs to be created


  // Form variables
  instrumentForm: FormGroup;

  queryStartDate = Date.now();
  queryEndDate = Date.now();
  queryByDateDisabled = true;
  startDateSelected = false;
  endDateSelected = false;
  queryLastValuesDisabled = true;
  mapResource = false;
  timeSeriesResource = false;
  discreteValueResource = false;
  summaryView = false;
  gatewayList: Gateway[] = [];
  gatewayIdSelected: '';

  // Map configuration
  mapConfig = null;
  mapMarkerUpdate = null;

  // Google Chart config
  // public timelineChartData:GoogleChartInterface =  {
  //   chartType: 'Timeline',
  //   dataTable: []
  // }

  public timelineChartData: GoogleChartInterface = {
    chartType: 'Timeline',
    dataTable: [
      ['Name', 'From', 'To'],
      ['Washington', new Date(1789, 3, 30), new Date(1797, 2, 4)],
      ['Adams', new Date(1797, 2, 4), new Date(1801, 2, 4)],
      ['Jefferson', new Date(1801, 2, 4), new Date(1809, 2, 4)]
    ],
    options: {
      height: 350
    }
  }

  // Chart variables
  public chartDatasets = [
    {
      label: '',
      borderColor: 'blue',
      //backgroundColor: 'rgba(54, 162, 235, 0.2)',
      type: 'line',
      // pointRadius: 0,
      fill: true,
      lineTension: 0,
      borderWidth: 2,
      data: []
    },
  ];

  public chartOptions = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      xAxes: [{
        type: 'time',
        distribution: 'series',
        ticks: {
          source: 'data',  // can use auto
          autoSkip: true
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Reading'
        },
        ticks: {
          beginAtZero: true
        }
      }]
    },
    tooltips: {
      enabled: true,
      intersect: false
    },
    plugins: {
      streaming: false,
      datalabels: {
        display: false
      }
    }
  };

  public chartStreamingDatasets = [
    {
      label: '',
      borderColor: 'blue',
      type: 'line',
      fill: true,
      lineTension: 0,
      borderWidth: 2,
      data: []
    },
  ];

  public chartStreamingOptions = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      xAxes: [{
        type: 'realtime',
        realtime: {
          onRefresh: this.getStreamData.bind(this),
          delay: 2000,
          refresh: 10000, // 1000
          duration: 120000
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Reading'
        },
        ticks: {
          beginAtZero: true
        }
      }]
    },
    tooltips: {
      enabled: true,
      intersect: false
    },
    plugins: {
      datalabels: {
        display: false
      }
    }
  };


  public chartLegend = true;
  public chartStreamingLegend = true;

  public chartType = 'line';
  public resourceReadings = [];

  public timeSeriesData = [];

  deviceSelected = "";
  resourceSelected = "";
  public streamLastQuery = Date.now();

  deviceOverview = null;
  devicesDataSource = new MatTableDataSource<Device>();
  deviceDisplayedColumns: string[] = ['name', 'id', 'operatingState', 'adminState', 'description'];
  deviceSelection = new SelectionModel<Device>(false, []);


  resourcesDataSource = new MatTableDataSource<Resource>();
  resourceDisplayedColumns: string[] = ['name', 'description'];
  resourceSelection = new SelectionModel<Resource>(false, []);

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(BaseChartDirective, { static: false }) deviceReportChart: BaseChartDirective;

  constructor(private edgeService: EdgeService,
    private graphService: DgraphService,
    private formBuilder: FormBuilder) {

    this.instrumentForm = this.formBuilder.group({
      valueType: [''],
      valueReadWrite: [''],
      valueMinimum: [''],
      valueMaximum: [''],
      valueDefault: [''],
      valueUnit: [''],
      interface: [''],
      interfacePinNumber: [''],
      interfaceType: ['']
    });

  }

  ngOnInit() {
    this.getGateways();
  }

  ngOnDestroy() {
    if (this.subscribed) {
      this.subscription.unsubscribe();
      this.subscribed = false;
    }
  }

  ngAfterViewInit() {
    this.devicesDataSource.sort = this.sort;
  }

  public getDevices(gateway) {
    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devicesDataSource.data = res as Device[];
      })
  }


  public getResourceReadings(deviceName, resourceName, numReadings) {

    this.graphService.getReadings(deviceName, resourceName, numReadings)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];

        console.log("reading data: ", this.resourceReadings);

        // Reset data for streaming chart dataset
        this.chartStreamingDatasets[0].data = [];

        if (this.mapResource) {
          this.setMapDataSet(deviceName);

        }
        else if (this.discreteValueResource) {
          console.log("calling setMapDataset");
          this.setTimelineDataSet(deviceName);
        }
        else {
          // Set Data for chart dataset
          this.setChartDataSet();
        }
      })
  }

  public getResourceReadingsBetween(deviceName, resourceName, fromts, tots) {
    this.graphService.getReadingsBetween(deviceName, resourceName, fromts, tots)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];

        console.log("reading data: ", this.resourceReadings);

        // Reset data for streaming chart dataset
        this.chartStreamingDatasets[0].data = [];

        if (this.mapResource) {
          this.setMapDataSet(deviceName);
        }
        else {
          // Set Data for chart dataset
          this.setChartDataSet();
        }

      })
  }

  public setChartDataSet() {

    this.timeSeriesData = [];

    this.resourceReadings.forEach(
      reading => {

        if (isNaN(reading.value)) {
          this.timeSeriesData.push({ x: new Date(reading.created).toISOString(), y: reading.value == 'true' ? 1 : 0 });
        }
        else {
          this.timeSeriesData.push({ x: new Date(reading.created).toISOString(), y: reading.value });
        }
      }
    );
    console.log("data transformed: ", this.timeSeriesData);

    this.chartDatasets[0].data = this.timeSeriesData;
  }

  public setMapDataSet(deviceName) {
    let mapData = [];
    let idx = this.resourceReadings.length - 1;
    let coords = this.resourceReadings[idx].value.split("|", 3);
    console.log("Setting marker for map reading: ", this.resourceReadings[idx].value);
    console.log("Setting marker for map: ", coords);

    mapData.push({
      lat: Number(coords[0]),
      lon: Number(coords[1]),
      label: coords[2],
      uuid: deviceName
    });

    let center = this.graphService.getRouteCenter(deviceName);

    if (this.createMapFlag) {
      this.mapConfig = {
        createMap: this.createMapFlag,
        centerLat: center[0],
        centerLon: center[1],
        zoom: 4,
        showColorAxis: false,
        data: mapData,
        polyline: this.graphService.getRoute(deviceName)
      };
      this.createMapFlag = false;
    }
    else {
      this.mapConfig = {
        createMap: this.createMapFlag,
        data: mapData,
      }
    }
  }

  setTimelineDataSet(deviceName) {
    console.log("setTimelineDataSet pt1");


    let ccComponent = this.timelineChartData.component;

    console.log("setTimelineDataSet pt2");

    this.timelineChartData.dataTable = [];
    this.timelineChartData.dataTable.push(['Name', 'From', 'To']);
    let numReadings = this.resourceReadings.length;

    console.log("setTimelineDataSet pt3: ", numReadings);

    if (numReadings > 1) {
      this.timelineChartData.dataTable.push(["Power Available",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Ready To Charge",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Charging",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Reduced Rate Charge",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Pause",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Fault",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);

      let i = 1;
      for (; i < numReadings; i++) {
        this.timelineChartData.dataTable.push([this.resourceReadings[i - 1].value,
        new Date(this.resourceReadings[i - 1].created), new Date(this.resourceReadings[i].created)]);
      }
      this.timelineChartData.dataTable.push([this.resourceReadings[i - 1].value,
      new Date(this.resourceReadings[i - 1].created), new Date(Date.now())]);
    }


    // this.timelineChartData.dataTable.push(['Name', 'From', 'To']);
    // this.timelineChartData.dataTable.push([ 'Juan', new Date(1789, 3, 30), new Date(1797, 2, 4) ]);
    // this.timelineChartData.dataTable.push([ 'Peter',      new Date(1797, 2, 4),  new Date(1801, 2, 4) ]);

    console.log("Timeline table: " + this.timelineChartData.dataTable)

    ccComponent.draw();

  }


  public getStreamData(chart: any) {

    if (this.resourceSelection.hasValue()) {


      console.log("in getting streaming data");

      this.graphService.getReadingsStartingAt(this.deviceSelected,
        this.resourceSelected, this.streamLastQuery)
        .subscribe(res => {
          this.resourceReadings = res as TSReading[];

          console.log("reading data in getStreamingData: ", this.resourceReadings);


          this.resourceReadings.forEach(
            reading => {

              if (isNaN(reading.value)) {
                chart.data.datasets[0].data.push({ x: new Date(reading.created).toISOString(), y: reading.value == 'true' ? 1 : 0 });
              }
              else {
                chart.data.datasets[0].data.push({ x: new Date(reading.created).toISOString(), y: reading.value });
              }

              this.streamLastQuery = reading.created;
            }
          );

        })
    }

  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.deviceSelection.selected.length;
    // const numRows = this.devicesDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  applyFilter(filterValue: string) {
    this.devicesDataSource.filter = filterValue.trim().toLowerCase();
  }

  getGateways() {
    console.log("Getting Gateways called")

    this.graphService.getGateways()
      .subscribe(res => {

        // this.gatewayList = [];
        this.gatewayList = res;
        console.log("Gateways Returned: ", res);
        // res.forEach((gate, index) => {
        //   this.gatewayList.push({
        //     value: gate.uuid,
        //     viewValue: gate.uuid
        //   });
        // });
        console.log("Updated gateway list: ", this.gatewayList);
      })
  }

  onGatewaySelected(event) {
    console.log("Option selected: ", event);

    this.getDevices(this.gatewayList[event.value]);
  }

  onDeviceClicked(row) {
    if (this.subscribed) {
      this.subscription.unsubscribe();
      this.subscribed = false;
    }


    this.mapResource = false;
    this.timeSeriesResource = false;
    this.discreteValueResource = false;
    this.summaryView = true;

    // Set variables for query enable/disable
    this.queryLastValuesDisabled = true;
    this.queryByDateDisabled = true;

    console.log('Row clicked: ', row);
    this.deviceSelection.select(row);
    this.deviceSelected = row.name;

    // Clear resource selection
    this.resourceSelection.clear();

    this.resourcesDataSource.data = row.profile.deviceResources as Resource[];
    this.deviceOverview = row;
  }

  onResourceClicked(row) {
    if (this.subscribed) {
      this.subscription.unsubscribe();
      this.subscribed = false;
    }

    console.log('Row clicked: ', row);
    this.resourceSelected = row.name;
    this.mapResource = false;
    this.timeSeriesResource = false;
    this.discreteValueResource = false;

    let numReadingsRequired = 300;

    if (this.resourceSelected == "GPS") {
      this.mapResource = true;
    }
    else if (row.properties.value.type == "String") {
      this.discreteValueResource = true;
      numReadingsRequired = 40;
    }
    else {
      this.timeSeriesResource = true;
    }

    // Set variables for query enable/disable
    this.queryLastValuesDisabled = false;
    if (this.startDateSelected && this.endDateSelected) {
      this.queryByDateDisabled = false;
    }

    this.resourceSelection.select(row);
    this.chartDatasets[0].label = row.name;

    // Update Instrument Form

    let attrInterface = '';
    let attrPinNum = '';
    let attrType = '';
    if (row.attributes != undefined) {
      attrInterface = row.attributes.Interface;
      attrPinNum = row.attributes.Pin_Num;
      attrType = row.attributes.Type;
    }

    this.instrumentForm.patchValue({
      valueType: row.properties.value.type,
      valueReadWrite: row.properties.value.readWrite,
      valueMinimum: row.properties.value.minimum,
      valueMaximum: row.properties.value.maximum,
      valueDefault: row.properties.value.defaultValue,
      valueUnit: row.properties.units.defaultValue,
      interface: attrInterface,
      interfacePinNumber: attrPinNum,
      interfaceType: attrType
    });

    this.createMapFlag = true;

    this.getResourceReadings(this.deviceSelected, this.resourceSelected, numReadingsRequired);

    if (this.mapResource) {
      this.subscription = this.source.subscribe(val => this.getResourceReadings(this.deviceSelected, this.resourceSelected, numReadingsRequired));
      this.subscribed = true;
    }

  }

  onQueryByDateClicked() {
    // Query data by date
    this.getResourceReadingsBetween(this.deviceSelected, this.resourceSelected, this.queryStartDate, this.queryEndDate);
  }

  onQueryLastValuesClicked() {
    // Query new data
    this.getResourceReadings(this.deviceSelected, this.resourceSelected, 300);
  }

  startDateEvent(event: MatDatepickerInputEvent<Date>) {
    console.log("Date Event received: ", event);

    this.queryStartDate = event.value.valueOf();
    console.log("Date value: ", this.queryStartDate);

    this.startDateSelected = true;

    if (this.endDateSelected) {
      this.queryByDateDisabled = false;
    }
  }

  endDateEvent(event: MatDatepickerInputEvent<Date>) {
    console.log("Date Event received: ", event);

    this.queryEndDate = event.value.valueOf();
    console.log("Date value: ", this.queryEndDate);

    this.endDateSelected = true;

    if (this.startDateSelected) {
      this.queryByDateDisabled = false;
    }
  }
}
