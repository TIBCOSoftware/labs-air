import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { SelectionModel } from '@angular/cdk/collections';

import { Subscription, Gateway } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { DgraphService } from '../../services/graph/dgraph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';

import { MatPaginator, MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-iot-gateway-subscription',
  templateUrl: './iot-gateway-subscription.component.html',
  styleUrls: ['./iot-gateway-subscription.component.css']
})
export class IotGatewaySubscriptionComponent implements OnInit, AfterViewInit {
  // Form variables
  subscriptionForm: FormGroup;

  gatewayId = "";
  gateway = null as Gateway;
  subscriptionSelected = "";
  hidePassword = true;
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  edgeOpsDisabled = true;
  graphOpsDisabled = true;

  subscriptionsDataSource = new MatTableDataSource<Subscription>();
  subscriptionDisplayedColumns: string[] = ['id', 'name', 'consumer', 'created', 'modified'];
  subscriptionSelection = new SelectionModel<Subscription>(false, []);

  destinations: SelectItem[] = [
    { value: 'REST_ENDPOINT', viewValue: 'REST_ENDPOINT' },
    { value: 'MQTT_TOPIC', viewValue: 'MQTT_TOPIC' }
  ];

  protocols: SelectItem[] = [
    { value: 'HTTP', viewValue: 'HTTP' },
    { value: 'HTTPS', viewValue: 'HTTPS' },
    { value: 'tcp', viewValue: 'TCP' }
  ];

  methods: SelectItem[] = [
    { value: 'POST', viewValue: 'POST' },
    { value: 'PUT', viewValue: 'PUT' }
  ];

  formats: SelectItem[] = [
    { value: 'JSON', viewValue: 'JSON' },
    { value: 'XML', viewValue: 'XML' }
  ];

  compressions: SelectItem[] = [
    { value: 'NONE', viewValue: 'NONE' },
    { value: 'GZIP', viewValue: 'GZIP' },
    { value: 'ZIP', viewValue: 'ZIP' }
  ];

  encryptions: SelectItem[] = [
    { value: 'NONE', viewValue: 'NONE' },
    { value: 'AES', viewValue: 'AES' }
  ];

  boolList = [
    { value: true, viewValue: 'TRUE' },
    { value: false, viewValue: 'FALSE' }
  ]


  @ViewChild(MatSort, { static: false }) sort: MatSort;


  constructor(private edgeService: EdgeService,
    private graphService: DgraphService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {

  }

  ngOnInit() {

    this.subscriptionForm = this.formBuilder.group({
      name: [''],
      consumer: [''],
      publisher: [''],
      destination: [''],
      protocol: [''],
      method: [''],
      address: [''],
      port: [''],
      path: [''],
      format: [''],
      enabled: [''],
      user: [''],
      password: [''],
      topic: [''],
      encryptionAlgorithm: [''],
      encryptionKey: [''],
      initializingVector: [''],
      compression: [''],
      deviceIdentifierFilter: [''],
      valueDescriptorFilter: [''],
      origin: [''],
      created: [''],
      modified: [''],
      uid: ['']
    });

    this.onFormChanges();

    console.log("Getting subscriptions");
    this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');

    this.getGatewayAndSubscriptions(this.gatewayId);

  }

  ngAfterViewInit() {
    this.subscriptionsDataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.subscriptionsDataSource.filter = filterValue.trim().toLowerCase();
  }

  public getGatewayAndSubscriptions(gatewayId: string) {
    console.log("Getting gateway and subscriptions for: ", gatewayId);

    this.graphService.getGatewayAndSubscriptions(gatewayId)
      .subscribe(res => {
        console.log("Received response: ", res);
        this.gateway = res[0] as Gateway;
        this.subscriptionsDataSource.data = res[0].subscriptions as Subscription[];
        this.edgeOpsDisabled = true;
        this.graphOpsDisabled = true;
      })
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.subscriptionSelection.selected.length;
    // const numRows = this.subscriptionsDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  onSubscriptionClicked(row) {

    console.log('Row clicked: ', row);

    this.subscriptionSelection.select(row);
    this.subscriptionSelected = row.name;

    // Update Instrument Form
    this.subscriptionForm.reset({
      name: row.name,
      consumer: row.consumer,
      publisher: row.publisher,
      destination: row.destination,
      protocol: row.protocol,
      method: row.method,
      address: row.address,
      port: row.port,
      path: row.path,
      format: row.format,
      enabled: row.enabled,
      user: row.user,
      password: row.password,
      topic: row.topic,
      encryptionAlgorithm: row.encryptionAlgorithm,
      encryptionKey: row.encryptionKey,
      initializingVector: row.initializingVector,
      compression: row.compression,
      deviceIdentifierFilter: row.deviceIdentifierFilter,
      valueDescriptorFilter: row.valueDescriptorFilter,
      origin: row.origin,
      created: row.created,
      modified: row.modified,
      uid: row.uid
    }, { emitEvent: false });

    this.edgeOpsDisabled = false;
    this.graphOpsDisabled = true;
  }

  resetSubscriptionForm() {
    this.subscriptionForm.reset({
    }, { emitEvent: false });

    this.edgeOpsDisabled = true;
    this.graphOpsDisabled = true;
  }

  addSubscription() {
    let ts = Date.now();
    let sub = new Subscription();
    sub.name = this.subscriptionForm.controls['name'].value;
    sub.consumer = this.subscriptionForm.controls['consumer'].value;
    sub.publisher = this.subscriptionForm.controls['publisher'].value;
    sub.destination = this.subscriptionForm.controls['destination'].value;
    sub.protocol = this.subscriptionForm.controls['protocol'].value;
    sub.method = this.subscriptionForm.controls['method'].value;
    sub.address = this.subscriptionForm.controls['address'].value;
    sub.port = this.subscriptionForm.controls['port'].value;
    sub.path = this.subscriptionForm.controls['path'].value;
    sub.format = this.subscriptionForm.controls['format'].value;
    sub.enabled = this.subscriptionForm.controls['enabled'].value;
    sub.user = this.subscriptionForm.controls['user'].value;
    sub.password = this.subscriptionForm.controls['password'].value;
    sub.topic = this.subscriptionForm.controls['topic'].value;
    sub.encryptionAlgorithm = this.subscriptionForm.controls['encryptionAlgorithm'].value;
    sub.encryptionKey = this.subscriptionForm.controls['encryptionKey'].value;
    sub.initializingVector = this.subscriptionForm.controls['initializingVector'].value;
    sub.compression = this.subscriptionForm.controls['compression'].value;
    sub.deviceIdentifierFilter = this.subscriptionForm.controls['deviceIdentifierFilter'].value;
    sub.valueDescriptorFilter = this.subscriptionForm.controls['valueDescriptorFilter'].value;
    sub.origin = ts;
    sub.created = ts;
    sub.modified = ts;
    sub.uid = this.subscriptionForm.controls['uid'].value;

    this.graphService.addSubscription(this.gateway.uid, sub)
      .subscribe(res => {
        console.log("Result from update dgraph", res);

        this.getGatewayAndSubscriptions(this.gatewayId);
        this.resetSubscriptionForm();
      });
  }

  updateSubscription() {

    console.log("Inside updatesubscription function");

    let ts = Date.now();
    let sub = new Subscription();
    sub.name = this.subscriptionForm.controls['name'].value;
    sub.consumer = this.subscriptionForm.controls['consumer'].value;
    sub.publisher = this.subscriptionForm.controls['publisher'].value;
    sub.destination = this.subscriptionForm.controls['destination'].value;
    sub.protocol = this.subscriptionForm.controls['protocol'].value;
    sub.method = this.subscriptionForm.controls['method'].value;
    sub.address = this.subscriptionForm.controls['address'].value;
    sub.port = this.subscriptionForm.controls['port'].value;
    sub.path = this.subscriptionForm.controls['path'].value;
    sub.format = this.subscriptionForm.controls['format'].value;
    sub.enabled = this.subscriptionForm.controls['enabled'].value;
    sub.user = this.subscriptionForm.controls['user'].value;
    sub.password = this.subscriptionForm.controls['password'].value;
    sub.topic = this.subscriptionForm.controls['topic'].value;
    sub.encryptionAlgorithm = this.subscriptionForm.controls['encryptionAlgorithm'].value;
    sub.encryptionKey = this.subscriptionForm.controls['encryptionKey'].value;
    sub.initializingVector = this.subscriptionForm.controls['initializingVector'].value;
    sub.compression = this.subscriptionForm.controls['compression'].value;
    sub.deviceIdentifierFilter = this.subscriptionForm.controls['deviceIdentifierFilter'].value;
    sub.valueDescriptorFilter = this.subscriptionForm.controls['valueDescriptorFilter'].value;
    sub.origin = this.subscriptionForm.controls['origin'].value;
    sub.created = this.subscriptionForm.controls['created'].value;
    sub.modified = ts;
    sub.uid = this.subscriptionForm.controls['uid'].value;

    this.graphService.updateSubscription(sub)
      .subscribe(res => {
        console.log("Result from update dgraph", res);

        this.getGatewayAndSubscriptions(this.gatewayId);
        this.resetSubscriptionForm();
      });
  }

  deleteSubscription() {
    this.graphService.deleteSubscription(this.gateway.uid, this.subscriptionForm.controls['uid'].value)
      .subscribe(res => {
        console.log("Result from delete ", res);

        this.getGatewayAndSubscriptions(this.gatewayId);
        this.resetSubscriptionForm();

      });
  }

  addRegistration() {
    let ts = Date.now();
    let sub = new Subscription();
    sub.name = this.subscriptionForm.controls['name'].value;
    sub.consumer = this.subscriptionForm.controls['consumer'].value;
    sub.publisher = this.subscriptionForm.controls['publisher'].value;
    sub.destination = this.subscriptionForm.controls['destination'].value;
    sub.protocol = this.subscriptionForm.controls['protocol'].value;
    sub.method = this.subscriptionForm.controls['method'].value;
    sub.address = this.subscriptionForm.controls['address'].value;
    sub.port = this.subscriptionForm.controls['port'].value;
    sub.path = this.subscriptionForm.controls['path'].value;
    sub.format = this.subscriptionForm.controls['format'].value;
    sub.enabled = this.subscriptionForm.controls['enabled'].value;
    sub.user = this.subscriptionForm.controls['user'].value;
    sub.password = this.subscriptionForm.controls['password'].value;
    sub.topic = this.subscriptionForm.controls['topic'].value;
    sub.encryptionAlgorithm = this.subscriptionForm.controls['encryptionAlgorithm'].value;
    sub.encryptionKey = this.subscriptionForm.controls['encryptionKey'].value;
    sub.initializingVector = this.subscriptionForm.controls['initializingVector'].value;
    sub.compression = this.subscriptionForm.controls['compression'].value;
    sub.deviceIdentifierFilter = this.subscriptionForm.controls['deviceIdentifierFilter'].value;
    sub.valueDescriptorFilter = this.subscriptionForm.controls['valueDescriptorFilter'].value;
    sub.origin = this.subscriptionForm.controls['origin'].value;
    sub.created = this.subscriptionForm.controls['created'].value;
    sub.modified = this.subscriptionForm.controls['modified'].value;
    sub.uid = this.subscriptionForm.controls['uid'].value;

    this.edgeService.addRegisteration(this.gateway, sub)
      .subscribe(res => {
        console.log("Result from subscribe: ", res);

        let message = 'Success';
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Add Subscription", {
          duration: 3000,
        });

      });
  }

  updateRegistration() {

    console.log("Inside updateRegistration function");

    let ts = Date.now();
    let sub = new Subscription();
    sub.name = this.subscriptionForm.controls['name'].value;
    sub.consumer = this.subscriptionForm.controls['consumer'].value;
    sub.publisher = this.subscriptionForm.controls['publisher'].value;
    sub.destination = this.subscriptionForm.controls['destination'].value;
    sub.protocol = this.subscriptionForm.controls['protocol'].value;
    sub.method = this.subscriptionForm.controls['method'].value;
    sub.address = this.subscriptionForm.controls['address'].value;
    sub.port = this.subscriptionForm.controls['port'].value;
    sub.path = this.subscriptionForm.controls['path'].value;
    sub.format = this.subscriptionForm.controls['format'].value;
    sub.enabled = this.subscriptionForm.controls['enabled'].value;
    sub.user = this.subscriptionForm.controls['user'].value;
    sub.password = this.subscriptionForm.controls['password'].value;
    sub.topic = this.subscriptionForm.controls['topic'].value;
    sub.encryptionAlgorithm = this.subscriptionForm.controls['encryptionAlgorithm'].value;
    sub.encryptionKey = this.subscriptionForm.controls['encryptionKey'].value;
    sub.initializingVector = this.subscriptionForm.controls['initializingVector'].value;
    sub.compression = this.subscriptionForm.controls['compression'].value;
    sub.deviceIdentifierFilter = this.subscriptionForm.controls['deviceIdentifierFilter'].value;
    sub.valueDescriptorFilter = this.subscriptionForm.controls['valueDescriptorFilter'].value;
    sub.origin = this.subscriptionForm.controls['origin'].value;
    sub.created = this.subscriptionForm.controls['created'].value;
    sub.modified = ts;
    sub.uid = this.subscriptionForm.controls['uid'].value;

    this.edgeService.updateRegisteration(this.gateway, sub)
      .subscribe(res => {
        console.log("Result from update ", res);

        let message = 'Success';
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Update Subscription", {
          duration: 3000,
        });
      });
  }

  deleteRegistration() {
    this.edgeService.deleteRegisteration(this.gateway, this.subscriptionForm.controls['name'].value)
      .subscribe(res => {
        console.log("Result from delete ", res);

        let message = 'Success';
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Delete Registration", {
          duration: 3000,
        });

      });
  }

  onFormChanges(): void {
    this.subscriptionForm.valueChanges.subscribe(val => {
      console.log("Form has changed for: ", val.name);

      if (this.subscriptionForm.dirty) {
        console.log("form is dirty");
        this.edgeOpsDisabled = true;
        this.graphOpsDisabled = false;
      }

    });
  }

}
