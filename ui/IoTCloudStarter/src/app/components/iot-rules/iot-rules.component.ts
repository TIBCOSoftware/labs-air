import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EdgeService } from '../../services/edge/edge.service';
import { DgraphService } from '../../services/graph/dgraph.service';
import { Device, TSReading, Resource, Gateway, Rule } from '../../shared/models/iot.model';
import { MatPaginator, MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-iot-rules',
  templateUrl: './iot-rules.component.html',
  styleUrls: ['./iot-rules.component.css']
})
export class IotRulesComponent implements OnInit, AfterViewInit {
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  // Form variables
  ruleForm: FormGroup;

  gatewayList: Gateway[] = [];
  selectedGateway = null as Gateway;

  rulesDataSource = new MatTableDataSource<Rule>();
  ruleDisplayedColumns: string[] = ['id', 'name', 'description', 'created', 'modified'];
  ruleSelection = new SelectionModel<Rule>(false, []);

  devicesDataSource = new MatTableDataSource<Device>();
  conditionResourcesDataSource = new MatTableDataSource<Resource>();
  actionResourcesDataSource = new MatTableDataSource<Resource>();

  operations: SelectItem[] = [
    { value: '=', viewValue: '=' },
    { value: '>', viewValue: '>' },
    { value: '>=', viewValue: '>=' },
    { value: '<', viewValue: '<' },
    { value: '<=', viewValue: '<=' }
  ];



  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(private edgeService: EdgeService,
    private graphService: DgraphService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.ruleForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      conditionDevice: ['', Validators.required],
      conditionResource: ['', Validators.required],
      conditionCompareToValue: [true],
      conditionCompareToValueOperation: ['', Validators.required],
      conditionValue: ['', Validators.required],
      conditionCompareToLastValue: [false],
      conditionCompareToLastValueOperation: [''],
      actionSendNotification: [true],
      actionNotification: ['', Validators.required],
      actionSendCommand: [true],
      actionDevice: ['', Validators.required],
      actionResource: ['', Validators.required],
      actionValue: ['', Validators.required],
      created: [''],
      modified: [''],
      uid: ['']
    });

    this.setConditionConpareToValueValidators();
    this.setConditionConpareToLastValueValidators();
    this.setActionSendNotificationValidators();
    this.setActionSendCommandValidators();

    this.getGateways();


  }

  ngAfterViewInit() {
    this.devicesDataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.rulesDataSource.filter = filterValue.trim().toLowerCase();
  }

  getGateways() {
    console.log("Getting Gateways called")

    this.graphService.getGateways()
      .subscribe(res => {

        // this.gatewayList = [];
        this.gatewayList = res;
        console.log("Gateways Returned: ", res);

        console.log("Updated gateway list: ", this.gatewayList);
      })
  }

  public getRules(gateway) {
    this.graphService.getRules(gateway.uuid)
      .subscribe(res => {
        this.rulesDataSource.data = res as Rule[];

        console.log("Rules received: ", this.rulesDataSource.data)
      })
  }

  public getDevices(gateway) {
    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devicesDataSource.data = res as Device[];

        console.log("Devices received: ", this.devicesDataSource.data)
      })
  }

  onGatewaySelected(event) {
    console.log("onGatewayelected: ", event);

    this.selectedGateway = this.gatewayList[event.value];

    console.log("Gateway selected: ", this.selectedGateway);

    this.getRules(this.selectedGateway);

    this.getDevices(this.selectedGateway);
  }

  onRuleClicked(row) {

    console.log('Row clicked: ', row);

    this.ruleSelection.select(row);

    // Set the resourceDataSource
    let idx = this.getIndexForDeviceDataSource(row.conditionDevice);
    this.conditionResourcesDataSource.data = this.devicesDataSource.data[idx].profile.deviceResources as Resource[];

    idx = this.getIndexForDeviceDataSource(row.actionDevice);
    this.actionResourcesDataSource.data = this.devicesDataSource.data[idx].profile.deviceResources as Resource[];

    // Update Instrument Form
    this.ruleForm.reset({
      name: row.name,
      description: row.description,
      conditionDevice: row.conditionDevice,
      conditionResource: row.conditionResource,
      conditionCompareToValue: row.conditionCompareToValue,
      conditionCompareToValueOperation: row.conditionCompareToValueOperation,
      conditionValue: row.conditionValue,
      conditionCompareToLastValue: row.conditionCompareToLastValue,
      conditionCompareToLastValueOperation: row.conditionCompareToLastValueOperation,
      actionSendNotification: row.actionSendNotification,
      actionNotification: row.actionNotification,
      actionSendCommand: row.actionSendCommand,
      actionDevice: row.actionDevice,
      actionResource: row.actionResource,
      actionValue: row.actionValue,
      created: row.created,
      modified: row.modified,
      uid: row.uid
    }, { emitEvent: true });
    
  }

  onConditionDeviceSelected(event) {

    console.log('Condition Device Selected: ', event);

    // Set the resourceDataSource
    let idx = this.getIndexForDeviceDataSource(event.value);
    this.conditionResourcesDataSource.data = this.devicesDataSource.data[idx].profile.deviceResources as Resource[];
  }

  onActionDeviceSelected(event) {

    console.log('Action Device Selected: ', event);

    // Set the resourceDataSource
    let idx = this.getIndexForDeviceDataSource(event.value);
    this.actionResourcesDataSource.data = this.devicesDataSource.data[idx].profile.deviceResources as Resource[];
  }

  onResourceSelected(event) {

  }


  onCommandResourceSelected(event) {

  }

 
  onSelection() {

  }

  resetRuleForm() {
    console.log("Resetting rule form");
    
    this.ruleForm.reset({
    }, { emitEvent: false });

    console.log("Form after resetting: ", this.ruleForm);
    
  }

  addRule() {
    console.log("Adding rule");

    let ts = Date.now();
    let rule = new Rule();
    rule.name = this.ruleForm.controls['name'].value;
    rule.uuid = this.ruleForm.controls['name'].value;
    rule.description = this.ruleForm.controls['description'].value;
    rule.conditionDevice = this.ruleForm.controls['conditionDevice'].value;
    rule.conditionResource = this.ruleForm.controls['conditionResource'].value;
    rule.conditionCompareToValue = this.ruleForm.controls['conditionCompareToValue'].value;
    rule.conditionCompareToValueOperation = this.ruleForm.controls['conditionCompareToValueOperation'].value;
    rule.conditionValue = this.ruleForm.controls['conditionValue'].value;
    rule.conditionCompareToLastValue = this.ruleForm.controls['conditionCompareToLastValue'].value;
    rule.conditionCompareToLastValueOperation = this.ruleForm.controls['conditionCompareToLastValueOperation'].value;
    rule.actionSendNotification = this.ruleForm.controls['actionSendNotification'].value;
    rule.actionNotification = this.ruleForm.controls['actionNotification'].value;
    rule.actionSendCommand = this.ruleForm.controls['actionSendCommand'].value;
    rule.actionDevice = this.ruleForm.controls['actionDevice'].value;
    rule.actionResource = this.ruleForm.controls['actionResource'].value;
    rule.actionValue = this.ruleForm.controls['actionValue'].value;
    rule.created = ts;
    rule.modified = ts;

    this.graphService.addRule(this.selectedGateway.uid, rule)
      .subscribe(res => {
        console.log("Result from add rule to dgraph", res);

        this.getRules(this.selectedGateway);
        this.resetRuleForm();
      });
  }

  updateRule() {
    console.log("Inside updateRule function");

    let ts = Date.now();
    let rule = new Rule();
    rule.name = this.ruleForm.controls['name'].value;
    rule.uuid = this.ruleForm.controls['name'].value;
    rule.description = this.ruleForm.controls['description'].value;
    rule.conditionDevice = this.ruleForm.controls['conditionDevice'].value;
    rule.conditionResource = this.ruleForm.controls['conditionResource'].value;
    rule.conditionCompareToValue = this.ruleForm.controls['conditionCompareToValue'].value;
    rule.conditionCompareToValueOperation = this.ruleForm.controls['conditionCompareToValueOperation'].value;
    rule.conditionValue = this.ruleForm.controls['conditionValue'].value;
    rule.conditionCompareToLastValue = this.ruleForm.controls['conditionCompareToLastValue'].value;
    rule.conditionCompareToLastValueOperation = this.ruleForm.controls['conditionCompareToLastValueOperation'].value;
    rule.actionSendNotification = this.ruleForm.controls['actionSendNotification'].value;
    rule.actionNotification = this.ruleForm.controls['actionNotification'].value;
    rule.actionSendCommand = this.ruleForm.controls['actionSendCommand'].value;
    rule.actionDevice = this.ruleForm.controls['actionDevice'].value;
    rule.actionResource = this.ruleForm.controls['actionResource'].value;
    rule.actionValue = this.ruleForm.controls['actionValue'].value;
    rule.uid = this.ruleForm.controls['uid'].value;
    rule.modified = ts;

    this.graphService.updateRule(rule)
      .subscribe(res => {
        console.log("Result from update dgraph", res);

        this.getRules(this.selectedGateway);
        this.resetRuleForm();
      });
  }

  deleteRule() {
    this.graphService.deleteRule(this.selectedGateway.uid, this.ruleForm.controls['uid'].value)
      .subscribe(res => {
        console.log("Result from delete ", res);

        this.getRules(this.selectedGateway);
        this.resetRuleForm();

      });
  }

  getIndexForDeviceDataSource(name: string): number {
    let idx = 0;

    for (let i = 0; i < this.devicesDataSource.data.length; i++) {
       
      if (this.devicesDataSource.data[i].name == name) {
        idx = i;
        break;
      } 
    }
    
    return idx;
  }


  onFormChanges(): void {
    this.ruleForm.valueChanges.subscribe(val => {
      console.log("Form has changed for: ", val.name);

      if (this.ruleForm.dirty) {
        console.log("form is dirty");
      }

    });
  }

  setConditionConpareToValueValidators() {
    const conditionCompareToValueOperationControl = this.ruleForm.get('conditionCompareToValueOperation');
    const conditionValueControl = this.ruleForm.get('conditionValue');

    this.ruleForm.get('conditionCompareToValue').valueChanges
      .subscribe(compareToValue => {

        if (compareToValue) {
          console.log("setting validator for compare to value");
          conditionCompareToValueOperationControl.setValidators([Validators.required]);
          conditionValueControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for action notification");
          conditionCompareToValueOperationControl.setValidators(null);
          conditionValueControl.setValidators(null);
        }

        conditionCompareToValueOperationControl.updateValueAndValidity();
        conditionValueControl.updateValueAndValidity();
      });
  }

  setConditionConpareToLastValueValidators() {
    const conditionCompareToLastValueOperationControl = this.ruleForm.get('conditionCompareToLastValueOperation');

    this.ruleForm.get('conditionCompareToLastValue').valueChanges
      .subscribe(compareToLastValue => {

        if (compareToLastValue) {
          console.log("setting validator for compare to value");
          conditionCompareToLastValueOperationControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for action notification");
          conditionCompareToLastValueOperationControl.setValidators(null);
        }

        conditionCompareToLastValueOperationControl.updateValueAndValidity();
      });
  }

  setActionSendNotificationValidators() {
    const actionNotificationControl = this.ruleForm.get('actionNotification');

    this.ruleForm.get('actionSendNotification').valueChanges
      .subscribe(sendNotification => {

        if (sendNotification) {
          console.log("setting validator for action notification");
          actionNotificationControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for action notification");
          actionNotificationControl.setValidators(null);
        }

        actionNotificationControl.updateValueAndValidity();
      });
  }

  setActionSendCommandValidators() {
    const actionDeviceControl = this.ruleForm.get('actionDevice');
    const actionResourceControl = this.ruleForm.get('actionResource');
    const actionValueControl = this.ruleForm.get('actionValue');

    this.ruleForm.get('actionSendCommand').valueChanges
      .subscribe(sendCommand => {

        if (sendCommand) {
          console.log("setting validator for command fields");
          actionDeviceControl.setValidators([Validators.required]);
          actionResourceControl.setValidators([Validators.required]);
          actionValueControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for command fields");
          actionDeviceControl.setValidators(null);
          actionResourceControl.setValidators(null);
          actionValueControl.setValidators(null);
        }

        actionDeviceControl.updateValueAndValidity();
        actionResourceControl.updateValueAndValidity();
        actionValueControl.updateValueAndValidity();
      });
  }


  deployRule() {

    let ts = Date.now();
    let rule = new Rule();
    rule.name = this.ruleForm.controls['name'].value;
    rule.uuid = this.ruleForm.controls['name'].value;
    rule.description = this.ruleForm.controls['description'].value;
    rule.conditionDevice = this.ruleForm.controls['conditionDevice'].value;
    rule.conditionResource = this.ruleForm.controls['conditionResource'].value;
    rule.conditionCompareToValue = this.ruleForm.controls['conditionCompareToValue'].value;
    rule.conditionCompareToValueOperation = this.ruleForm.controls['conditionCompareToValueOperation'].value;
    rule.conditionValue = this.ruleForm.controls['conditionValue'].value;
    rule.conditionCompareToLastValue = this.ruleForm.controls['conditionCompareToLastValue'].value;
    rule.conditionCompareToLastValueOperation = this.ruleForm.controls['conditionCompareToLastValueOperation'].value;
    rule.actionSendNotification = this.ruleForm.controls['actionSendNotification'].value;
    rule.actionNotification = this.ruleForm.controls['actionNotification'].value;
    rule.actionSendCommand = this.ruleForm.controls['actionSendCommand'].value;
    rule.actionDevice = this.ruleForm.controls['actionDevice'].value;
    rule.actionResource = this.ruleForm.controls['actionResource'].value;
    rule.actionValue = this.ruleForm.controls['actionValue'].value;
    rule.created = ts;
    rule.modified = ts;

    this.edgeService.addRule(this.selectedGateway, rule)
      .subscribe(res => {
        console.log("Result from adding rule: ", res);

        let message = 'Success'
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Deploy Rule", {
          duration: 3000,
        });

      });
  }


  undeployRule() {
    let rule = new Rule();
    rule.name = this.ruleForm.controls['name'].value;

    this.edgeService.deleteRule(this.selectedGateway, rule)
      .subscribe(res => {
        console.log("Result from deleting rule: ", res);

        let message = 'Success'
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Undeploy Rule", {
          duration: 3000,
        });

      });

  }

}
