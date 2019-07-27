import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { SelectionModel } from '@angular/cdk/collections';

import { Gateway } from '../../shared/models/iot.model';
import { DgraphService } from '../../services/graph/dgraph.service';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
//import { merge } from "rxjs/observable/merge";
//import { fromEvent } from 'rxjs/observable/fromEvent';
// // import { DevicesDataSource } from "../services/edge/devices.datasource";
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'app-iot-gateway',
  templateUrl: './iot-gateway.component.html',
  styleUrls: ['./iot-gateway.component.css']
})
export class IotGatewayComponent implements OnInit, AfterViewInit {

  subscriptionDisabled = true; 
  selectedGateway = '';

  gatewayForm: FormGroup;
  dataSource = new MatTableDataSource<Gateway>();
  displayedColumns: string[] = ['uuid', 'created', 'updated'];
  selection = new SelectionModel<Gateway>(false, []);
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor(private graphService: DgraphService,
    private formBuilder: FormBuilder,
    private logger: LogService) {

    logger.level = LogLevel.Debug;

    this.gatewayForm = this.formBuilder.group( {
      uuid: ['', Validators.required],
      address: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
    });

  }

  ngOnInit() {
    // this.dataSource = new DevicesDataSource(this.edgeService);
    // this.dataSource.loadDevices();
    this.getGateways();

    // selection changed
    // this.selection.onChange.subscribe((a) => {
    //   if (a.added[0])   // will be undefined if no selection
    //   {
    //     // alert('You selected ' + a.added[0]);
    //     console.log('Row clicked: ', a.added[0]);
    //   }
    // });
  }

  public getGateways() {
    console.log("Getting Gateways called")
    this.logger.debug("Getting Gateways");


    this.graphService.getGateways()
      .subscribe(res => {
        this.dataSource.data = res as Gateway[];
        console.log("Received response: ", res);
      })
  }

  public addGateway() {

  }

  public updateGateway() {

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.selection.selected.length;
    // const numRows = this.dataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onRowClicked(row) {
    //console.log('Row clicked: ', row);

    // Enable/Disable variables
    this.subscriptionDisabled = false;

    this.selection.select(row);
    this.selectedGateway = row.uuid;

    // Update Gateway Form
    this.gatewayForm.patchValue({
      uuid: row.uuid,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude
    });

  }




}
