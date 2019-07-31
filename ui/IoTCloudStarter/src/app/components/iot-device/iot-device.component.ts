import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { SelectionModel } from '@angular/cdk/collections';

import { Device, TSReading, Resource } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { DgraphService } from '../../services/graph/dgraph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
//import { merge } from "rxjs/observable/merge";
//import { fromEvent } from 'rxjs/observable/fromEvent';
import { MatPaginator, MatSort, MatTableDataSource, MatDatepickerInputEvent } from '@angular/material';

import { BaseChartDirective, defaultColors, Label, MultiDataSet, SingleDataSet } from 'ng2-charts';
import { ChartType } from 'chart.js';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import 'chartjs-plugin-streaming';

@Component({
  selector: 'app-iot-device',
  templateUrl: './iot-device.component.html',
  styleUrls: ['./iot-device.component.css']
})
export class IotDeviceComponent implements OnInit, AfterViewInit {
  // Form variables
  instrumentForm: FormGroup;

  queryByDateDisabled = true;
  startDateSelected = false;
  endDateSelected = false;
  queryLastValuesDisabled = true;


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
    this.edgeService.getDevices()
      .subscribe(res => {
        this.devicesDataSource.data = res as Device[];
      })
  }


  public getResourceReadings(deviceName, resourceName) {
    this.graphService.getReadings(deviceName, resourceName)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];

        console.log("reading data: ", this.resourceReadings);

        // Reset data for streaming chart dataset
        this.chartStreamingDatasets[0].data = [];

        // Set Data for chart dataset
        this.setChartDataSet();

        //this.chartDatasets[0].data = this.dataset;
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

  public getStreamData(chart: any) {

    if (this.resourceSelection.hasValue()) {


      console.log("in getting streaming data");

      this.graphService.getReadingsStartingAt(this.deviceSelected,
        this.resourceSelected, this.streamLastQuery)
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
    // Set variables for query enable/disable
    this.queryLastValuesDisabled = true;
    this.queryByDateDisabled = true;

    console.log('Row clicked: ', row);
    this.deviceSelection.select(row);
    this.deviceSelected = row.name;

    // Clear resource selection
    this.resourceSelection.clear();

    // this.getResourceReadings();
    this.resourcesDataSource.data = row.profile.deviceResources as Resource[];
  }

  onResourceClicked(row) {
    console.log('Row clicked: ', row);
    // Set variables for query enable/disable
    this.queryLastValuesDisabled = false;
    if (this.startDateSelected && this.endDateSelected) {
      this.queryByDateDisabled = false;
    }

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

    this.resourceSelected = row.name;
    this.getResourceReadings(this.deviceSelected, this.resourceSelected);
  }

  onQueryByDateClicked() {

  }

  onQueryLastValuesClicked() {
    // Query new data
    this.getResourceReadings(this.deviceSelected, this.resourceSelected);
  }

  startDateEvent(event: MatDatepickerInputEvent<Date>) {
    console.log("Date Event received: ", event);
    this.startDateSelected = true;

    if (this.endDateSelected) {
      this.queryByDateDisabled = false;
    }
  }

  endDateEvent(event: MatDatepickerInputEvent<Date>) {
    console.log("Date Event received: ", event);
    this.endDateSelected = true;

    if (this.startDateSelected) {
      this.queryByDateDisabled = false;
    }
  }
}
