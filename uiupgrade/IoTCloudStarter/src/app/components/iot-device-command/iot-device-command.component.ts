import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { SelectionModel } from '@angular/cdk/collections';

import { Device, Resource, Command, Gateway } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { DgraphService } from '../../services/graph/dgraph.service';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';

import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

interface CommandEditor {
  idx: number;
  id: string;
  name: string;
  method: string;
  path: string;
  returnVal: string;
  paramVal: string
}

@Component({
  selector: 'app-iot-device-command',
  templateUrl: './iot-device-command.component.html',
  styleUrls: ['./iot-device-command.component.css']
})
export class IotDeviceCommandComponent implements OnInit, AfterViewInit {

  gatewaySelected: Gateway = null;
  gatewayIdSelected: '';
  deviceSelected = "";
  resourceSelected = "";

  gatewayList: Gateway[] = [];

  devicesDataSource = new MatTableDataSource<Device>();
  deviceDisplayedColumns: string[] = ['name', 'id', 'operatingState', 'adminState', 'description'];
  deviceSelection = new SelectionModel<Device>(false, []);


  resourcesDataSource = new MatTableDataSource<Resource>();
  resourceDisplayedColumns: string[] = ['name', 'description'];
  resourceSelection = new SelectionModel<Resource>(false, []);

  commands: CommandEditor[] = [];
  commandsDataSource = new MatTableDataSource<CommandEditor>();
  commandsDisplayedColumns: string[] = ['name', 'method', 'paramVal', 'operation', 'returnVal'];

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(private edgeService: EdgeService,
    private graphService: DgraphService) {

  }

  ngOnInit() {
    this.getGateways();
    // this.getDevices();
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

  applyFilter(filterValue: string) {
    this.devicesDataSource.filter = filterValue.trim().toLowerCase();
  }

  getGateways() {
    console.log("Getting Gateways called")

    this.graphService.getGateways()
      .subscribe(res => {

        console.log("Gateways Returned: ", res);
        this.gatewayList = res;
        
        console.log("Updated gateway list: ", this.gatewayList);
      })
  }

  onGatewaySelected(event) {
    console.log("Option selected: ", event.value);

    this.gatewaySelected = this.gatewayList[event.value];
    this.getDevices(this.gatewaySelected);
  }

  onDeviceClicked(row) {
    console.log('Row clicked: ', row);
    this.deviceSelection.select(row);
    this.deviceSelected = row.id;

    // Clear resource selection
    this.resourceSelection.clear();
    
    // this.getResourceReadings();
    this.resourcesDataSource.data = row.profile.deviceResources as Resource[];

    this.initializeCommands(row.profile.coreCommands);
  }

  onResourceClicked(row) {
    console.log('Row clicked: ', row);
    this.resourceSelection.select(row);


    this.resourceSelected = row.name;

  }

  initializeCommands(deviceCommands: Command[]) {

    console.log("Initializing commands: ", deviceCommands);

    this.commandsDataSource.data = null;
    this.commands = [];

    let cnt = 0;
    deviceCommands.forEach((cmd, index) => {

      // Check if get available
      if (cmd.get.path != null) {
        this.commands.push({
          idx: cnt,
          id: cmd.id,
          name: cmd.name,
          method: 'get',
          path: cmd.get.path,
          returnVal: '',
          paramVal: ''
        });
        cnt++;
      }

      // Check if put available
      if (cmd.put.path != null) {
        this.commands.push({
          idx: cnt,
          id: cmd.id,
          name: cmd.name,
          method: 'put',
          path: cmd.put.path,
          returnVal: '',
          paramVal: ''
        });
        cnt++;
      }

    });

    this.commandsDataSource.data = this.commands as CommandEditor[];

  }

  sendCommand(row) {
  
    console.log("Commad to use: ", row);

    if (row.method == "get") {
      let cmdPath = `device/${this.deviceSelected}/command/${row.id}`;

      console.log("Generated GET command path: ", cmdPath);

      this.edgeService.getCommand(this.gatewaySelected, cmdPath)
      .subscribe(res => {
        
        this.commandsDataSource.data[row.idx].returnVal = res.readings[0].value;
      });
    }
    else {

    }

  }

}
