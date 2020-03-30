import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { SelectionModel } from '@angular/cdk/collections';

import { Publisher, Gateway } from '../../shared/models/iot.model';
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
  selector: 'app-iot-gateway-publisher',
  templateUrl: './iot-gateway-publisher.component.html',
  styleUrls: ['./iot-gateway-publisher.component.css']
})
export class IotGatewayPublisherComponent implements OnInit, AfterViewInit {

  // Form variables
  publisherForm: FormGroup;

  gatewayId = "";
  gateway = null as Gateway;
  publisherSelected = "";
  hidePassword = true;
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  graphOpsDisabled = true;
  graphDeleteOpsDisabled = true;

  publishersDataSource = new MatTableDataSource<Publisher>();
  publisherDisplayedColumns: string[] = ['id', 'name', 'protocol', 'created', 'modified'];
  publisherSelection = new SelectionModel<Publisher>(false, []);

  protocols: SelectItem[] = [
    { value: 'MQTT', viewValue: 'MQTT' },
    { value: 'Kafka', viewValue: 'Kafka' }
  ];

  @ViewChild(MatSort, { static: false }) sort: MatSort;


  constructor(private edgeService: EdgeService,
    private graphService: DgraphService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {

  }

  ngOnInit() {

    this.publisherForm = this.formBuilder.group({
      name: [''],
      protocol: [''],
      hostname: [''],
      port: [''],
      topic: [''],
      created: [''],
      modified: [''],
      uid: ['']
    });


    this.onFormChanges();

    console.log("Getting publishers");
    this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');

    this.getGatewayAndPublishers(this.gatewayId);

  }

  ngAfterViewInit() {
    this.publishersDataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.publishersDataSource.filter = filterValue.trim().toLowerCase();
  }

  public getGatewayAndPublishers(gatewayId: string) {
    console.log("Getting gateway and publishers for: ", gatewayId);

    this.graphService.getGatewayAndPublishers(gatewayId)
      .subscribe(res => {
        console.log("Received response: ", res);
        this.gateway = res[0] as Gateway;
        this.publishersDataSource.data = res[0].publishers as Publisher[];
        this.graphOpsDisabled = true;
        this.graphDeleteOpsDisabled = true;
      })
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.publisherSelection.selected.length;
    // const numRows = this.publishersDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  onPublisherClicked(row) {

    console.log('Row clicked: ', row);

    this.publisherSelection.select(row);
    this.publisherSelected = row.name;

    // Update Instrument Form
    this.publisherForm.reset({
      name: row.name,
      protocol: row.protocol,
      hostname: row.hostname,
      port: row.port,
      topic: row.topic,
      created: row.created,
      modified: row.modified,
      uid: row.uid
    }, { emitEvent: false });

    this.graphDeleteOpsDisabled = false;
    this.graphOpsDisabled = true;
  }

  resetPublisherForm() {
    this.publisherForm.reset({
    }, { emitEvent: false });

    this.graphDeleteOpsDisabled = true;
    this.graphOpsDisabled = true;
  }

  addPublisher() {
    let ts = Date.now();
    let pub = new Publisher();
    pub.name = this.publisherForm.controls['name'].value;
    pub.protocol = this.publisherForm.controls['protocol'].value;
    pub.hostname = this.publisherForm.controls['hostname'].value;
    pub.port = this.publisherForm.controls['port'].value;
    pub.topic = this.publisherForm.controls['topic'].value;
    pub.created = ts;
    pub.modified = ts;
    pub.uid = this.publisherForm.controls['uid'].value;

    this.graphService.addPublisher(this.gateway.uid, pub)
      .subscribe(res => {
        console.log("Result from add publisher", res);

        this.getGatewayAndPublishers(this.gatewayId);
        this.resetPublisherForm();
      });
  }

  updatePublisher() {

    console.log("Inside updatepublisher function");

    let ts = Date.now();
    let pub = new Publisher();
    pub.name = this.publisherForm.controls['name'].value;
    pub.protocol = this.publisherForm.controls['protocol'].value;
    pub.hostname = this.publisherForm.controls['hostname'].value;
    pub.port = this.publisherForm.controls['port'].value;
    pub.topic = this.publisherForm.controls['topic'].value;
    pub.created = this.publisherForm.controls['created'].value;
    pub.modified = ts;
    pub.uid = this.publisherForm.controls['uid'].value;

    this.graphService.updatePublisher(pub)
      .subscribe(res => {
        console.log("Result from update dgraph", res);

        this.getGatewayAndPublishers(this.gatewayId);
        this.resetPublisherForm();
      });
  }

  deletePublisher() {
    this.graphService.deletePublisher(this.gateway.uid, this.publisherForm.controls['uid'].value)
      .subscribe(res => {
        console.log("Result from delete ", res);

        this.getGatewayAndPublishers(this.gatewayId);
        this.resetPublisherForm();

      });
  }

  onFormChanges(): void {
    this.publisherForm.valueChanges.subscribe(val => {
      console.log("Form has changed for: ", val.name);

      if (this.publisherForm.dirty) {
        console.log("form is dirty");
        this.graphDeleteOpsDisabled = true;
        this.graphOpsDisabled = false;
      }

    });
  }

}
