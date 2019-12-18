import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { SelectionModel } from '@angular/cdk/collections';

import { Device, TSReading, Resource } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { DgraphService } from '../../services/graph/dgraph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import { MatSort, MatTableDataSource } from '@angular/material';

import { BaseChartDirective, defaultColors, Label, MultiDataSet, SingleDataSet } from 'ng2-charts';

import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import 'chartjs-plugin-streaming';


@Component({
  selector: 'app-iot-device-stream',
  templateUrl: './iot-device-stream.component.html',
  styleUrls: ['./iot-device-stream.component.css']
})
export class IotDeviceStreamComponent implements OnInit, AfterViewInit {
  // Form variables
  instrumentForm: FormGroup;

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

  public timeSeriesData = [];

  public chartOptions = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      xAxes: [{
        type: 'realtime',
        realtime: {
          onRefresh: this.getStreamData.bind(this),
          delay: 2000,
          refresh: 1000,
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
  public chartType = 'line';
  public resourceReadings = [];
  public streamDeviceName = '';
  public streamResourceName = '';
  public streamLastQuery = Date.now();


  devicesDataSource = new MatTableDataSource<Device>();
  deviceDisplayedColumns: string[] = ['name', 'id', 'operatingState', 'adminState', 'description'];
  deviceSelection = new SelectionModel<Device>(false, []);
  deviceSelected = "";

  resourcesDataSource = new MatTableDataSource<Resource>();
  resourceDisplayedColumns: string[] = ['name', 'description'];
  resourceSelection = new SelectionModel<Resource>(false, []);

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(BaseChartDirective, {static: false}) deviceReportChart: BaseChartDirective;

  constructor(private edgeService: EdgeService,
    private graphService: DgraphService,
    private formBuilder: FormBuilder) {

    this.instrumentForm = this.formBuilder.group({
      valueType: [''],
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
    this.getDevices();
  }

  public getDevices() {
    let gateway = null;
    // Hardcoded for gateway1
    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devicesDataSource.data = res as Device[];
      })
  }

  public getResourceReadings(deviceName, resourceName) {
    this.streamDeviceName = deviceName;
    this.streamResourceName = resourceName;
    this.streamLastQuery = Date.now();

    this.timeSeriesData = [];

    this.chartDatasets[0].data = this.timeSeriesData;

  }

  public getStreamData(chart: any) {
    // chart.data.datasets[0].data.push({
    //   x: Date.now(),
    //   y: Math.random()
    // });


    console.log("in getting streaming data");


    this.graphService.getReadingsStartingAt(this.streamDeviceName, 
      this.streamResourceName, this.streamLastQuery)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];

        console.log("reading data: ", this.resourceReadings);

        
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

  public getResourceReadingsOrig(deviceName, resourceName) {
    this.graphService.getReadings(deviceName, resourceName, 300)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];

        console.log("reading data: ", this.resourceReadings);

        this.setChartDataSet();

        //this.chartDatasets[0].data = this.dataset;
      })
  }

  public setChartDataSetOrig() {

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

  ngAfterViewInit() {
    this.devicesDataSource.sort = this.sort;
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

  onDeviceClicked(row) {
    console.log('Row clicked: ', row);
    this.deviceSelection.select(row);
    this.deviceSelected = row.name;

    // this.getResourceReadings();
    this.resourcesDataSource.data = row.profile.deviceResources as Resource[];
  }

  onResourceClicked(row) {
    console.log('Row clicked: ', row);
    this.resourceSelection.select(row);
    this.chartDatasets[0].label = row.name;

    // Update Instrument Form
    this.instrumentForm.patchValue({
      valueType: row.properties.value.type,
      valueMinimum: row.properties.value.minimum,
      valueMaximum: row.properties.value.maximum,
      valueDefault: row.properties.value.defaultValue,
      valueUnit: row.properties.units.defaultValue,
      interface: row.attributes.Interface,
      interfacePinNumber: row.attributes.Pin_Num,
      interfaceType: row.attributes.Type
    });

    this.getResourceReadings(this.deviceSelected, row.name);
  }

}
