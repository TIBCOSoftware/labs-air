import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { SelectionModel } from '@angular/cdk/collections';

import { Subscription } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { DgraphService } from '../../services/graph/dgraph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';

import { MatPaginator, MatSort, MatTableDataSource, MatDatepickerInputEvent, MatSnackBar } from '@angular/material';

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

  gateway = "";
  subscriptionSelected = "";
  hidePassword = true;

  subscriptionsDataSource = new MatTableDataSource<Subscription>();
  subscriptionDisplayedColumns: string[] = ['name', 'consumer', 'origin'];
  subscriptionSelection = new SelectionModel<Subscription>(false, []);

  protocols: SelectItem[] = [
    { value: 'HTTP', viewValue: 'HTTP' },
    { value: 'HTTPS', viewValue: 'HTTPS' },
    { value: 'MQTT', viewValue: 'MQTT' },
    { value: 'KAFKA', viewValue: 'KAFKA' }
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

    this.subscriptionForm = this.formBuilder.group({
      name: [''],
      consumer: [''],
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

  }

  ngOnInit() {

    console.log("Getting subscriptions");
    this.gateway = this.route.snapshot.paramMap.get('gatewayId');

    this.getSubscriptions(this.gateway);
  }

  public getSubscriptions(gatewayId: string) {
    console.log("Getting subscriptions for: ", gatewayId);

    this.graphService.getSubscriptions(gatewayId)
      .subscribe(res => {
        this.subscriptionsDataSource.data = res as Subscription[];
      })
  }

  ngAfterViewInit() {
    this.subscriptionsDataSource.sort = this.sort;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.subscriptionSelection.selected.length;
    // const numRows = this.subscriptionsDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  applyFilter(filterValue: string) {
    this.subscriptionsDataSource.filter = filterValue.trim().toLowerCase();
  }

  onsubscriptionClicked(row) {

    console.log('Row clicked: ', row);
    this.subscriptionSelection.select(row);
    this.subscriptionSelected = row.name;

    // Update Instrument Form
    this.subscriptionForm.patchValue({
      name: row.name,
      consumer: row.consumer,
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
    });


  }

  addSubscription() {
    let ts = Date.now();
    let sub = new Subscription();
    sub.name = this.subscriptionForm.controls['name'].value;
    sub.consumer = this.subscriptionForm.controls['consumer'].value;
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
    sub.created = ts;
    sub.modified = ts;
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

    this.graphService.updateSubscription(sub)
      .subscribe(res => {
        console.log("Result from update dgraph", res)
      });

  }

  updateSubscription() {

    console.log("Inside updatesubscription function");

    let ts = Date.now();
    let sub = new Subscription();
    sub.name = this.subscriptionForm.controls['name'].value;
    sub.consumer = this.subscriptionForm.controls['consumer'].value;
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

    this.graphService.updateSubscription(sub)
      .subscribe(res => {
        console.log("Result from update dgraph", res)
      });
  }

  deleteSubscription() {
    this.edgeService.deleteRegisteration(this.gateway, this.subscriptionForm.controls['name'].value)
      .subscribe(res => {
        console.log("Result from delete ", res);

        let message = 'Success';
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Remove Subscription", {
          duration: 3000,
        });

      });
  }

}
