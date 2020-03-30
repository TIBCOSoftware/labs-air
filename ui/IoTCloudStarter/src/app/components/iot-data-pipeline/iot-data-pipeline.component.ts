import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatStepper } from '@angular/material';

import { SelectionModel } from '@angular/cdk/collections';

import { Pipeline, DataStore, Protocol, Gateway } from '../../shared/models/iot.model';
import { DgraphService } from '../../services/graph/dgraph.service';
import { FlogoDeployService } from '../../services/deployment/flogo-deploy.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { switchMap, debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';

import { MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-iot-data-pipeline',
  templateUrl: './iot-data-pipeline.component.html',
  styleUrls: ['./iot-data-pipeline.component.css']
})
export class IotDataPipelineComponent implements OnInit, AfterViewInit {

  // Form variables
  pipelineForm: FormGroup;
  transportForm: FormGroup;
  dataStoreForm: FormGroup;
  filteringForm: FormGroup;
  streamingForm: FormGroup;

  transportViewForm: FormGroup;
  dataStoreViewForm: FormGroup;
  filteringViewForm: FormGroup;
  streamingViewForm: FormGroup;

  gatewayId = "";
  gateway = null as Gateway;
  pipelineSelected = false;  // Used to control the display of buttons
  hidePassword = true;
  dateFormat = 'yyyy-MM-dd  HH:mm:ss';
  
  undeployDisabled = true;
  deployDisabled = true;

  pipelinesDataSource = new MatTableDataSource<Pipeline>();
  pipelineDisplayedColumns: string[] = ['id', 'name', 'protocolType', 'dataStoreType', 'status', 'created', 'modified'];
  pipelineSelection = new SelectionModel<Pipeline>(false, []);

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('stepper', { static: false }) stepper: MatStepper;

  constructor(private graphService: DgraphService,
    private flogoDeployService: FlogoDeployService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {

  }

  ngOnInit() {

    this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');

    this.createForms();

    this.onFormChanges();

    console.log("Getting pipelines");

    this.getGatewayAndPipelines(this.gatewayId);


  }

  ngAfterViewInit() {
    this.pipelinesDataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.pipelinesDataSource.filter = filterValue.trim().toLowerCase();
  }

  public getGatewayAndPipelines(gatewayId: string) {
    console.log("Getting gateway and pipelines for: ", gatewayId);

    this.graphService.getGatewayAndPipelines(gatewayId)
      .subscribe(res => {
        console.log("Received response: ", res);
        this.gateway = res[0] as Gateway;



        if (res[0].pipelines != undefined) {

          console.log("Setting pipelineDataSource.data fo incoming pipeline");


          this.pipelinesDataSource.data = res[0].pipelines as Pipeline[];

          console.log("Got Pipelines on pilpelinesDataSource.data: " + this.pipelinesDataSource.data.toString());
        }
        else {

          this.pipelinesDataSource = new MatTableDataSource<Pipeline>();

          console.log("Setting pipelineDataSource.data to null");
        }

      })
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.pipelineSelection.selected.length;
    // const numRows = this.pipelinesDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  /*
  * Handles selection of pipeline on table
  */
  onPipelineClicked(row) {

    console.log('Row clicked: ', row);

    this.pipelineSelection.select(row);
    this.pipelineSelected = true;

    // Update Pipeline Form
    this.pipelineForm.reset({
      uid: row.uid,
      name: row.name,
      prototypeType: row.protocolType,
      dataStoreType: row.dataStoreType,
      status: row.status,
    }, { emitEvent: false });

    // Reset command buttons
    if (row.status == "Undeployed") {
      this.deployDisabled = false;
      this.undeployDisabled = true;
    }
    else {
      this.deployDisabled = true;
      this.undeployDisabled = false;
    }


    if (row.protocolType == "MQTT") {

      let delimInd = row.protocol.brokerURL.lastIndexOf(":");
      let hostname = row.protocol.brokerURL.substring(6, delimInd);
      let port = row.protocol.brokerURL.substring(delimInd + 1);

      console.log("BrokerURL parsing: ", delimInd, " ", hostname, " ", port);

      // Update protocol view form
      console.log("Setting transportviewform protocol to: ", row.protocolType);

      this.transportViewForm.patchValue({
        protocol: row.protocolType,
        mqtt: {
          hostname: hostname,
          port: port,
          topic: row.protocol.topic,
          maximumQOS: row.protocol.maximumQOS,
          connectionTimeout: row.protocol.connectionTimeout,
          username: row.protocol.username,
          password: row.protocol.password,
          encryptionMode: row.protocol.encryptionMode,
          clientCertificate: row.protocol.clientCertificate,
          caCertificate: row.protocol.caCertificate,
          clientKey: row.protocol.clientKey
        }
      });

    }
    else if (row.protocolType == "Kafka") {

      let delimInd = row.protocol.brokerURL.lastIndexOf(":");
      let hostname = row.protocol.brokerURL.substring(0, delimInd);
      let port = row.protocol.brokerURL.substring(delimInd + 1);

      this.transportViewForm.patchValue({
        protocol: row.protocolType,
        kafka: {
          hostname: hostname,
          port: port,
          topic: row.protocol.topic,
          consumerGroupId: row.protocol.consumerGroupId,
          connectionTimeout: row.protocol.connectionTimeout,
          sessionTimeout: row.protocol.sessionTimeout,
          initialOffset: row.protocol.initialOffset,
          retryBackoff: row.protocol.retryBackoff,
          fetchMinBytes: row.protocol.fetchMinBytes,
          fetchMaxWait: row.protocol.fetchMaxWait,
          commitInterval: row.protocol.commitInterval,
          heartbeatInterval: row.protocol.heartbeatInterval,
          authMode: row.protocol.authMode,
          username: row.protocol.username,
          password: row.protocol.password,
          clientCertificate: row.protocol.clientCertificate,
          serverCertificate: row.protocol.serverCertificate,
          clientKey: row.protocol.clientKey
        }
      });
    }


    if (row.dataStoreType == "Postgres") {

      // Update datastore view form
      this.dataStoreViewForm.patchValue({
        dataStore: row.dataStoreType,
        postgres: {
          host: row.dataStore.host,
          port: row.dataStore.port.toString(),
          databaseName: row.dataStore.databaseName,
          user: row.dataStore.user,
          password: row.dataStore.password
        }

      });

    }
    else if (row.dataStoreType == "Snowflake") {

      this.dataStoreViewForm.patchValue({
        dataStore: row.dataStoreType,
        snowflake: {
          accountName: row.dataStore.accountName,
          warehouse: row.dataStore.warehouse,
          database: row.dataStore.database,
          schema: row.dataStore.schema,
          authType: row.dataStore.authType,
          username: row.dataStore.username,
          password: row.dataStore.password,
          role: row.dataStore.role,
          clientId: row.dataStore.clientId,
          clientSecret: row.dataStore.clientSecret,
          authorizationCode: row.dataStore.authorizationCode,
          redirectURI: row.dataStore.redirectURI,
          loginTimeout: row.dataStore.loginTimeout
        }

      });

    }
    else if (row.dataStoreType == "TGDB") {

      this.dataStoreViewForm.patchValue({
        dataStore: row.dataStoreType,
        tgdb: {
          url: row.dataStore.url,
          username: row.dataStore.username,
          password: row.dataStore.password
        }

      });

    }
    else if (row.dataStoreType == "Dgraph") {

      this.dataStoreViewForm.patchValue({
        dataStore: row.dataStoreType,
        dgraph: {
          url: row.dataStore.url,
          username: row.dataStore.username,
          password: row.dataStore.password
        }

      });

    }

  }

  resetPipelineForm() {
    this.pipelineForm.reset({
    }, { emitEvent: false });

  }

  updatePipeline() {

    console.log("Inside updatesubscription function");

    let ts = Date.now();
    let pl = new Pipeline();
    pl.name = this.pipelineForm.controls['name'].value;
    pl.protocolType = this.pipelineForm.controls['protocolType'].value;
    pl.dataStoreType = this.pipelineForm.controls['dataStoreType'].value;
    pl.created = this.pipelineForm.controls['created'].value;
    pl.status = this.pipelineForm.controls['status'].value;
    pl.modified = ts;
    pl.uid = this.pipelineForm.controls['uid'].value;

    this.graphService.updatePipeline(pl)
      .subscribe(res => {
        console.log("Result from update dgraph", res);

        this.getGatewayAndPipelines(this.gatewayId);
        this.resetPipelineForm();
      });
  }

  deletePipeline() {
    this.graphService.deletePipeline(this.gateway.uid, this.pipelineForm.controls['uid'].value)
      .subscribe(res => {
        console.log("Result from delete ", res);

        this.getGatewayAndPipelines(this.gatewayId);
        this.resetPipelineForm();

      });
  }


  onFormChanges(): void {
    this.pipelineForm.valueChanges.subscribe(val => {
      console.log("Form has changed for: ", val.name);

      if (this.pipelineForm.dirty) {
        console.log("form is dirty");
        
      }

    });
  }

  deployDataPipeline() {
    console.log("Deploying pipeline");

    let protocol = this.transportForm.get('protocol').value;
    let protocolObj = this.buildProtocolProperties(protocol, this.transportForm);
    let dataStore = this.dataStoreForm.get('dataStore').value;
    let dataStoreObj = this.buildDataStoreProperties(dataStore, this.dataStoreForm);

    console.log("Deploying for protocol: " + protocol);

    let tsms = Date.now();

    let applicationId = "iot-data-" + tsms;
    let request = {
      "ApplicationID": applicationId,
      "containerName": "air-iotdata-" + protocol.toLowerCase() + "-" + dataStore.toLowerCase(),
      "dockerImage": "magallardo/iotdata_" + protocol.toLowerCase() + "_" + dataStore.toLowerCase(),
      "replicas": 1,
      "Components": [
        protocolObj,
        dataStoreObj
      ]
    };

    console.log("Deploy Request: " + JSON.stringify(request));

    // Deploy pipeline
    this.flogoDeployService.deploy(request)
      .subscribe(res => {
        console.log("Received response: ", res);

      });


    // Save pipeline
    let pipeline = new Pipeline();
    pipeline.created = tsms;
    pipeline.modified = tsms;
    pipeline.name = applicationId;
    pipeline.protocolType = protocol;
    pipeline.dataStoreType = dataStore;
    pipeline.status = "Deployed/Ready";

    // Add pipeline to graph
    this.graphService.addPipeline(this.gateway.uid, pipeline, protocolObj, dataStoreObj)
      .subscribe(res => {
        console.log("Added pipeline: ", res);

        this.getGatewayAndPipelines(this.gatewayId)

      });

    this.resetFormsToDefaults();


  }

  undeployDataPipeline(updateGraph: boolean) {

    console.log("Undeploying pipeline with: ", updateGraph);

    if (this.pipelineSelection.hasValue) {

      this.pipelineSelected = false;
      let tsms = Date.now();
      let pipeline = this.pipelineSelection.selected[0];
      pipeline.modified = tsms;
      pipeline.status = "Undeployed";

      let request = {
        "ApplicationID": pipeline.name,
        "Components": [
          {
            "Type": "protocol",
            "Name": pipeline.protocolType
          },
          {
            "Type": "datastore",
            "Name": pipeline.dataStoreType
          }
        ]
      };

      console.log("Undeploy Request: " + JSON.stringify(request));


      // Undeploy pipeline
      this.flogoDeployService.undeploy(request)
        .subscribe(res => {
          console.log("Received response: ", res);

        });

      if (updateGraph) {
        // Update graph pipeline
        this.graphService.updatePipeline(pipeline)
          .subscribe(res => {
            console.log("Updated pipeline: ", res);

            this.getGatewayAndPipelines(this.gatewayId)
            this.resetPipelineForm();
            this.resetViewForms();
          });

        // this.undeployDisabled = true;
        // this.deployDisabled = false;
      }


    }
    else {
      console.log("No selection to undeploy");

    }

  }

  redeployDataPipeline() {

    if (this.pipelineSelection.hasValue) {

      this.pipelineSelected = false;
      let tsms = Date.now();
      let pipeline = this.pipelineSelection.selected[0]
      pipeline.modified = tsms;
      pipeline.status = "Deployed/Ready";

      console.log("ReDeploying for protocol: " + pipeline.protocolType);

      let protocolObj = this.buildProtocolProperties(pipeline.protocolType, this.transportViewForm);
      let dataStoreObj = this.buildDataStoreProperties(pipeline.dataStoreType, this.dataStoreViewForm);

      let applicationId = pipeline.name;
      let request = {
        "ApplicationID": applicationId,
        "containerName": "air-iotdata-" + pipeline.protocolType.toLowerCase() + "-" + pipeline.dataStoreType.toLowerCase(),
        "dockerImage": "magallardo/iotdata_" + pipeline.protocolType.toLowerCase() + "_" + pipeline.dataStoreType.toLowerCase(),
        "replicas": 1,
        "Components": [
          protocolObj,
          dataStoreObj
        ]
      };

      console.log("Deploy Request: " + JSON.stringify(request));

      // Deploy Pipeline
      this.flogoDeployService.deploy(request)
        .subscribe(res => {
          console.log("Received response: ", res);

        });


      // Update graph pipeline
      this.graphService.updatePipeline(pipeline)
        .subscribe(res => {
          console.log("Updated pipeline: ", res);

          this.getGatewayAndPipelines(this.gatewayId)
          this.resetPipelineForm();
          this.resetViewForms();
        });
    }
    else {
      console.log("No selection to redeploy");

    }

  }

  deleteDataPipeline() {

    console.log("Delete Data Pipeline called");


    if (this.pipelineSelection.hasValue) {

      this.pipelineSelected = false;

      let pipeline = this.pipelineSelection.selected[0]

      if (pipeline.status != "Undeployed") {
        this.undeployDataPipeline(false);
      }
      this.pipelineSelection.clear();

      this.graphService.deletePipeline(this.gateway.uid, pipeline)
        .subscribe(res => {
          console.log("Result from delete pipeline", res);

          this.getGatewayAndPipelines(this.gatewayId);
          this.resetPipelineForm();
          this.resetViewForms();
        });
    }
    else {
      console.log("No selection to delete");

    }

  }

  /*
  * Create forms to add pipelines as well as form to view pipeline information
  */
  createForms() {

    this.pipelineForm = this.formBuilder.group({
      uid: ['', Validators.required],
      name: ['', Validators.required],
      created: ['', Validators.required],
      modified: ['', Validators.required],
      protocolType: ['', Validators.required],
      protocolId: ['', Validators.required],
      dataStoreType: ['', Validators.required],
      dataStoreId: ['', Validators.required],
      status: ['', Validators.required]
    });

    this.transportForm = this.formBuilder.group({
      gateway: [this.gatewayId, Validators.required],
      protocolId: ['', Validators.required],
      protocol: ['', Validators.required],
      mqtt: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        encryptionMode: ['None', Validators.required],
        caCertificate: [''],
        clientCertificate: [''],
        clientKey: [''],
        topic: ['changeme', Validators.required],
        maximumQOS: ['2', Validators.required]
      }),
      kafka: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        authMode: ['None', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        clientCertificate: [''],
        clientKey: [''],
        serverCertificate: [''],
        connectionTimeout: ['30', Validators.required],
        retryBackoff: ['3', Validators.required],
        topic: ['changeme', Validators.required],
        consumerGroupId: ['changeme', Validators.required],
        commitInterval: ['500', Validators.required],
        initialOffset: ['Oldest', Validators.required],
        fetchMinBytes: ['1', Validators.required],
        fetchMaxWait: ['500', Validators.required],
        heartbeatInterval: ['3000', Validators.required],
        sessionTimeout: ['30000', Validators.required]
      })
    });

    this.dataStoreForm = this.formBuilder.group({
      dataStoreId: ['changeme', Validators.required],
      dataStore: ['', Validators.required],
      postgres: this.formBuilder.group({
        host: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        databaseName: ['changeme', Validators.required],
        user: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      snowflake: this.formBuilder.group({
        accountName: ['changeme', Validators.required],
        warehouse: ['changeme', Validators.required],
        database: ['changeme', Validators.required],
        schema: ['changeme', Validators.required],
        authType: ['Basic Authentication', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        role: ['changeme', Validators.required],
        clientId: [''],
        clientSecret: [''],
        authorizationCode: [''],
        redirectURI: [''],
        loginTimeout: ['20', Validators.required]
      }),
      dgraph: this.formBuilder.group({
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      tgdb: this.formBuilder.group({
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      })
    });

    this.filteringForm = this.formBuilder.group({
      deviceName: ['']
    });

    this.streamingForm = this.formBuilder.group({
      deviceName: ['']
    });


    this.transportViewForm = this.formBuilder.group({
      gateway: [this.gatewayId, Validators.required],
      protocolId: ['', Validators.required],
      protocol: ['', Validators.required],
      mqtt: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        encryptionMode: ['None', Validators.required],
        caCertificate: [''],
        clientCertificate: [''],
        clientKey: [''],
        topic: ['changeme', Validators.required],
        maximumQOS: ['2', Validators.required]
      }),
      kafka: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        authMode: ['None', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        clientCertificate: [''],
        clientKey: [''],
        serverCertificate: [''],
        connectionTimeout: ['30', Validators.required],
        retryBackoff: ['3', Validators.required],
        topic: ['changeme', Validators.required],
        consumerGroupId: ['changeme', Validators.required],
        commitInterval: ['500', Validators.required],
        initialOffset: ['Oldest', Validators.required],
        fetchMinBytes: ['1', Validators.required],
        fetchMaxWait: ['500', Validators.required],
        heartbeatInterval: ['3000', Validators.required],
        sessionTimeout: ['30000', Validators.required]
      })
    });

    this.dataStoreViewForm = this.formBuilder.group({
      dataStoreId: ['changeme', Validators.required],
      dataStore: ['', Validators.required],
      postgres: this.formBuilder.group({
        host: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        databaseName: ['changeme', Validators.required],
        user: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      snowflake: this.formBuilder.group({
        accountName: ['changeme', Validators.required],
        warehouse: ['changeme', Validators.required],
        database: ['changeme', Validators.required],
        schema: ['changeme', Validators.required],
        authType: ['Basic Authentication', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        role: ['changeme', Validators.required],
        clientId: [''],
        clientSecret: [''],
        authorizationCode: [''],
        redirectURI: [''],
        loginTimeout: ['20', Validators.required]
      }),
      dgraph: this.formBuilder.group({
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      tgdb: this.formBuilder.group({
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      })
    });

    this.filteringViewForm = this.formBuilder.group({
      deviceName: ['']
    });

    this.streamingViewForm = this.formBuilder.group({
      deviceName: ['']
    });

  }


  resetFormsToDefaults() {

    console.log("Resetting forms to defaults");

    this.transportForm.patchValue({
      gateway: this.gateway,
      protocolId: '',
      protocol: '',
      mqtt: {
        hostname: '',
        port: '',
        username: '',
        password: '',
        encryptionMode: 'None',
        caCertificate: '',
        clientCertificate: '',
        clientKey: '',
        topic: '',
        maximumQOS: '2'
      },
      kafka: {
        hostname: '',
        port: '',
        authMode: 'None',
        username: '',
        password: '',
        clientCertificate: '',
        clientKey: '',
        serverCertificate: '',
        connectionTimeout: '30',
        retryBackoff: '3',
        topic: '',
        consumerGroupId: '',
        commitInterval: '500',
        initialOffset: 'Oldest',
        fetchMinBytes: '1',
        fetchMaxWait: '500',
        heartbeatInterval: '3000',
        sessionTimeout: '30000',
      }
    },
      { emitEvent: true }
    );

    this.dataStoreForm.patchValue({
      dataStoreId: 'changeme',
      dataStore: '',
      postgres: {
        host: '',
        port: '',
        databaseName: '',
        user: '',
        password: ''
      },
      snowflake: {
        accountName: '',
        warehouse: '',
        database: '',
        schema: '',
        authType: 'Basic Authentication',
        username: '',
        password: '',
        role: '',
        clientId: '',
        clientSecret: '',
        authorizationCode: '',
        redirectURI: '',
        loginTimeout: '20'
      },
      tgdb: {
        url: '',
        username: '',
        password: ''
      },
      dgraph: {
        url: '',
        username: '',
        password: ''
      }
    });

    this.filteringForm.patchValue({
      deviceName: ''
    });

    this.streamingForm.patchValue({
      deviceName: ''
    });



    Object.keys(this.transportForm.controls).forEach(key => {

      this.transportForm.get(key).setErrors(null);
    });

    this.transportForm.get('mqtt.hostname').setErrors(null);
    this.transportForm.get('mqtt.port').setErrors(null);
    this.transportForm.get('mqtt.topic').setErrors(null);
    this.transportForm.get('mqtt.username').setErrors(null);
    this.transportForm.get('mqtt.password').setErrors(null);

    this.transportForm.get('kafka.hostname').setErrors(null);
    this.transportForm.get('kafka.port').setErrors(null);
    this.transportForm.get('kafka.topic').setErrors(null);
    this.transportForm.get('kafka.consumerGroupId').setErrors(null);
    this.transportForm.get('kafka.username').setErrors(null);
    this.transportForm.get('kafka.password').setErrors(null);

    Object.keys(this.dataStoreForm.controls).forEach(key => {

      this.dataStoreForm.get(key).setErrors(null);
    });

    this.dataStoreForm.get('postgres.host').setErrors(null);
    this.dataStoreForm.get('postgres.port').setErrors(null);
    this.dataStoreForm.get('postgres.databaseName').setErrors(null);
    this.dataStoreForm.get('postgres.user').setErrors(null);
    this.dataStoreForm.get('postgres.password').setErrors(null);

    this.dataStoreForm.get('snowflake.accountName').setErrors(null);
    this.dataStoreForm.get('snowflake.warehouse').setErrors(null);
    this.dataStoreForm.get('snowflake.database').setErrors(null);
    this.dataStoreForm.get('snowflake.schema').setErrors(null);
    this.dataStoreForm.get('snowflake.username').setErrors(null);
    this.dataStoreForm.get('snowflake.password').setErrors(null);
    this.dataStoreForm.get('snowflake.role').setErrors(null);
    this.dataStoreForm.get('snowflake.clientId').setErrors(null);
    this.dataStoreForm.get('snowflake.clientSecret').setErrors(null);
    this.dataStoreForm.get('snowflake.authorizationCode').setErrors(null);
    this.dataStoreForm.get('snowflake.redirectURI').setErrors(null);

    this.dataStoreForm.get('tgdb.url').setErrors(null);
    this.dataStoreForm.get('tgdb.username').setErrors(null);
    this.dataStoreForm.get('tgdb.password').setErrors(null);

    this.dataStoreForm.get('dgraph.url').setErrors(null);
    this.dataStoreForm.get('dgraph.username').setErrors(null);
    this.dataStoreForm.get('dgraph.password').setErrors(null);

    this.stepper.selectedIndex = 0;

  }

  resetViewForms() {
    this.transportViewForm.reset({
    }, { emitEvent: true });

    this.dataStoreViewForm.reset({
    }, { emitEvent: true });
  }


  // getPipeline(pipelineId): Pipeline {
  //   let pipeline = null;

  //   let len = this.config.profile.deviceResources.length;

  //   for (let i = 0; i < len && deviceResource == null; i++) {
  //     if (resourceName == this.config.profile.deviceResources[i].name) {
  //       deviceResource = this.config.profile.deviceResources[i];
  //     }
  //   }

  //   return deviceResource;
  // }

  buildProtocolPropertiesOld(protocol): any {

    let protocolObj = null;

    if (protocol == "MQTT") {

      protocolObj = {
        "Type": "protocol",
        "Name": protocol,
        "Properties": [
          { "Name": "MQTTTrigger.Topic", "UIName": "topic", "Value": this.transportForm.get('mqtt.topic').value },
          { "Name": "MQTTTrigger.MaximumQOS", "UIName": "maximumQOS", "Value": this.transportForm.get('mqtt.maximumQOS').value },
          { "Name": "Mqtt.IoTMQTT.Broker_URL", "UIName": "brokerURL", "Value": "tcp://" + this.transportForm.get('mqtt.hostname').value + ":" + this.transportForm.get('mqtt.port').value },
          { "Name": "Mqtt.IoTMQTT.Username", "UIName": "username", "Value": this.transportForm.get('mqtt.username').value },
          { "Name": "Mqtt.IoTMQTT.Password", "UIName": "password", "Value": this.transportForm.get('mqtt.password').value },
          { "Name": "Mqtt.encryptionMode", "UIName": "encryptionMode", "Value": this.transportForm.get('mqtt.encryptionMode').value },
          { "Name": "Mqtt.caCertificate", "UIName": "caCertificate", "Value": this.transportForm.get('mqtt.caCertificate').value },
          { "Name": "Mqtt.clientCertificate", "UIName": "clientCertificate", "Value": this.transportForm.get('mqtt.clientCertificate').value },
          { "Name": "Mqtt.clientKey", "UIName": "clientKey", "Value": this.transportForm.get('mqtt.clientKey').value }
        ]
      };

    }
    else if (protocol == "Kafka") {

      protocolObj = {
        "Type": "protocol",
        "Name": protocol,
        "Properties": [
          { "Name": "", "UIName": "brokerURL", "Value": this.transportForm.get('kafka.hostname').value + ":" + this.transportForm.get('kafka.port').value },
          { "Name": "", "UIName": "topic", "Value": this.transportForm.get('kafka.topic').value },
          { "Name": "", "UIName": "authMode", "Value": this.transportForm.get('kafka.authMode').value },
          { "Name": "", "UIName": "username", "Value": this.transportForm.get('kafka.username').value },
          { "Name": "", "UIName": "password", "Value": this.transportForm.get('kafka.password').value },
          { "Name": "", "UIName": "clientCertificate", "Value": this.transportForm.get('kafka.clientCertificate').value },
          { "Name": "", "UIName": "clientKey", "Value": this.transportForm.get('kafka.clientKey').value },
          { "Name": "", "UIName": "serverCertificate", "Value": this.transportForm.get('kafka.serverCertificate').value },
          { "Name": "", "UIName": "consumerGroupId", "Value": this.transportForm.get('kafka.consumerGroupId').value },
          { "Name": "", "UIName": "connectionTimeout", "Value": this.transportForm.get('kafka.connectionTimeout').value },
          { "Name": "", "UIName": "sessionTimeout", "Value": this.transportForm.get('kafka.sessionTimeout').value },
          { "Name": "", "UIName": "retryBackoff", "Value": this.transportForm.get('kafka.retryBackoff').value },
          { "Name": "", "UIName": "commitInterval", "Value": this.transportForm.get('kafka.commitInterval').value },
          { "Name": "", "UIName": "initialOffset", "Value": this.transportForm.get('kafka.initialOffset').value },
          { "Name": "", "UIName": "fetchMinBytes", "Value": this.transportForm.get('kafka.fetchMinBytes').value },
          { "Name": "", "UIName": "fetchMaxWait", "Value": this.transportForm.get('kafka.fetchMaxWait').value },
          { "Name": "", "UIName": "heartbeatInterval", "Value": this.transportForm.get('kafka.heartbeatInterval').value }
        ]
      };
    }

    return protocolObj;

  }

  buildDataStorePropertiesOld(dataStore): any {

    let dataStoreObj = null;

    if (dataStore == "Postgres") {

      dataStoreObj = {
        "Type": "datastore",
        "Name": dataStore,
        "Properties": [
          { "Name": "PostgreSQL.IoTPostgres.Host", "UIName": "host", "Value": this.dataStoreForm.get('postgres.host').value },
          { "Name": "PostgreSQL.IoTPostgres.Port", "UIName": "port", "Value": this.dataStoreForm.get('postgres.port').value },
          { "Name": "PostgreSQL.IoTPostgres.Database_Name", "UIName": "databaseName", "Value": this.dataStoreForm.get('postgres.databaseName').value },
          { "Name": "PostgreSQL.IoTPostgres.User", "UIName": "user", "Value": this.dataStoreForm.get('postgres.user').value },
          { "Name": "PostgreSQL.IoTPostgres.Password", "UIName": "password", "Value": this.dataStoreForm.get('postgres.password').value }
        ]
      };

    }
    else if (dataStore == "Snowflake") {

      dataStoreObj = {
        "Type": "datastore",
        "Name": dataStore,
        "Properties": [
          { "Name": "", "UIName": "accountName", "Value": this.dataStoreForm.get('snowflake.accountName').value },
          { "Name": "", "UIName": "warehouse", "Value": this.dataStoreForm.get('snowflake.accountName').value },
          { "Name": "", "UIName": "database", "Value": this.dataStoreForm.get('snowflake.database').value },
          { "Name": "", "UIName": "schema", "Value": this.dataStoreForm.get('snowflake.schema').value },
          { "Name": "", "UIName": "authType", "Value": this.dataStoreForm.get('snowflake.authType').value },
          { "Name": "", "UIName": "username", "Value": this.dataStoreForm.get('snowflake.username').value },
          { "Name": "", "UIName": "password", "Value": this.dataStoreForm.get('snowflake.password').value },
          { "Name": "", "UIName": "clientId", "Value": this.dataStoreForm.get('snowflake.clientId').value },
          { "Name": "", "UIName": "clientSecret", "Value": this.dataStoreForm.get('snowflake.clientSecret').value },
          { "Name": "", "UIName": "authorizationCode", "Value": this.dataStoreForm.get('snowflake.authorizationCode').value },
          { "Name": "", "UIName": "redirectURI", "Value": this.dataStoreForm.get('snowflake.redirectURI').value },
          { "Name": "", "UIName": "loginTimeout", "Value": this.dataStoreForm.get('snowflake.loginTimeout').value }
        ]
      }

    }
    else if (dataStore == "TGDB") {

      dataStoreObj = {
        "Type": "datastore",
        "Name": dataStore,
        "Properties": [
          { "Name": "", "UIName": "url", "Value": this.dataStoreForm.get('tgdb.url').value },
          { "Name": "", "UIName": "username", "Value": this.dataStoreForm.get('tgdb.username').value },
          { "Name": "", "UIName": "password", "Value": this.dataStoreForm.get('tgdb.password').value }
        ]
      }

    }
    else if (dataStore = "Dgraph") {

      dataStoreObj = {
        "Type": "datastore",
        "Name": dataStore,
        "Properties": [
          { "Name": "GraphBuilder_dgraph.IoTDgraph.Dgraph_Server_URL", "UIName": "url", "Value": this.dataStoreForm.get('dgraph.url').value },
          { "Name": "GraphBuilder_dgraph.IoTDgraph.Username", "UIName": "username", "Value": this.dataStoreForm.get('dgraph.username').value },
          { "Name": "GraphBuilder_dgraph.IoTDgraph.Password", "UIName": "password", "Value": this.dataStoreForm.get('dgraph.password').value }
        ]
      };

    };

    return dataStoreObj;
  }


  buildProtocolProperties(protocol, form: FormGroup): any {

    let protocolObj = null;

    if (protocol == "MQTT") {

      protocolObj = {
        "Type": "protocol",
        "Name": protocol,
        "Properties": [
          { "Name": "MQTTTrigger.Topic", "UIName": "topic", "Value": form.get('mqtt.topic').value },
          { "Name": "MQTTTrigger.MaximumQOS", "UIName": "maximumQOS", "Value": form.get('mqtt.maximumQOS').value },
          { "Name": "Mqtt.IoTMQTT.Broker_URL", "UIName": "brokerURL", "Value": "tcp://" + form.get('mqtt.hostname').value + ":" + form.get('mqtt.port').value },
          { "Name": "Mqtt.IoTMQTT.Username", "UIName": "username", "Value": form.get('mqtt.username').value },
          { "Name": "Mqtt.IoTMQTT.Password", "UIName": "password", "Value": form.get('mqtt.password').value },
          { "Name": "Mqtt.encryptionMode", "UIName": "encryptionMode", "Value": form.get('mqtt.encryptionMode').value },
          { "Name": "Mqtt.caCertificate", "UIName": "caCertificate", "Value": form.get('mqtt.caCertificate').value },
          { "Name": "Mqtt.clientCertificate", "UIName": "clientCertificate", "Value": form.get('mqtt.clientCertificate').value },
          { "Name": "Mqtt.clientKey", "UIName": "clientKey", "Value": form.get('mqtt.clientKey').value }
        ]
      };

    }
    else if (protocol == "Kafka") {

      protocolObj = {
        "Type": "protocol",
        "Name": protocol,
        "Properties": [
          { "Name": "", "UIName": "brokerURL", "Value": form.get('kafka.hostname').value + ":" + form.get('kafka.port').value },
          { "Name": "", "UIName": "topic", "Value": form.get('kafka.topic').value },
          { "Name": "", "UIName": "authMode", "Value": form.get('kafka.authMode').value },
          { "Name": "", "UIName": "username", "Value": form.get('kafka.username').value },
          { "Name": "", "UIName": "password", "Value": form.get('kafka.password').value },
          { "Name": "", "UIName": "clientCertificate", "Value": form.get('kafka.clientCertificate').value },
          { "Name": "", "UIName": "clientKey", "Value": form.get('kafka.clientKey').value },
          { "Name": "", "UIName": "serverCertificate", "Value": form.get('kafka.serverCertificate').value },
          { "Name": "", "UIName": "consumerGroupId", "Value": form.get('kafka.consumerGroupId').value },
          { "Name": "", "UIName": "connectionTimeout", "Value": form.get('kafka.connectionTimeout').value },
          { "Name": "", "UIName": "sessionTimeout", "Value": form.get('kafka.sessionTimeout').value },
          { "Name": "", "UIName": "retryBackoff", "Value": form.get('kafka.retryBackoff').value },
          { "Name": "", "UIName": "commitInterval", "Value": form.get('kafka.commitInterval').value },
          { "Name": "", "UIName": "initialOffset", "Value": form.get('kafka.initialOffset').value },
          { "Name": "", "UIName": "fetchMinBytes", "Value": form.get('kafka.fetchMinBytes').value },
          { "Name": "", "UIName": "fetchMaxWait", "Value": form.get('kafka.fetchMaxWait').value },
          { "Name": "", "UIName": "heartbeatInterval", "Value": form.get('kafka.heartbeatInterval').value }
        ]
      };
    }

    return protocolObj;

  }

  buildDataStoreProperties(dataStore, form: FormGroup): any {

    let dataStoreObj = null;

    if (dataStore == "Postgres") {

      dataStoreObj = {
        "Type": "datastore",
        "Name": dataStore,
        "Properties": [
          { "Name": "PostgreSQL.IoTPostgres.Host", "UIName": "host", "Value": form.get('postgres.host').value },
          { "Name": "PostgreSQL.IoTPostgres.Port", "UIName": "port", "Value": form.get('postgres.port').value },
          { "Name": "PostgreSQL.IoTPostgres.Database_Name", "UIName": "databaseName", "Value": form.get('postgres.databaseName').value },
          { "Name": "PostgreSQL.IoTPostgres.User", "UIName": "user", "Value": form.get('postgres.user').value },
          { "Name": "PostgreSQL.IoTPostgres.Password", "UIName": "password", "Value": form.get('postgres.password').value }
        ]
      };

    }
    else if (dataStore == "Snowflake") {

      dataStoreObj = {
        "Type": "datastore",
        "Name": dataStore,
        "Properties": [
          { "Name": "", "UIName": "accountName", "Value": form.get('snowflake.accountName').value },
          { "Name": "", "UIName": "warehouse", "Value": form.get('snowflake.accountName').value },
          { "Name": "", "UIName": "database", "Value": form.get('snowflake.database').value },
          { "Name": "", "UIName": "schema", "Value": form.get('snowflake.schema').value },
          { "Name": "", "UIName": "authType", "Value": form.get('snowflake.authType').value },
          { "Name": "", "UIName": "username", "Value": form.get('snowflake.username').value },
          { "Name": "", "UIName": "password", "Value": form.get('snowflake.password').value },
          { "Name": "", "UIName": "clientId", "Value": form.get('snowflake.clientId').value },
          { "Name": "", "UIName": "clientSecret", "Value": form.get('snowflake.clientSecret').value },
          { "Name": "", "UIName": "authorizationCode", "Value": form.get('snowflake.authorizationCode').value },
          { "Name": "", "UIName": "redirectURI", "Value": form.get('snowflake.redirectURI').value },
          { "Name": "", "UIName": "loginTimeout", "Value": form.get('snowflake.loginTimeout').value }
        ]
      }

    }
    else if (dataStore == "TGDB") {

      dataStoreObj = {
        "Type": "datastore",
        "Name": dataStore,
        "Properties": [
          { "Name": "", "UIName": "url", "Value": form.get('tgdb.url').value },
          { "Name": "", "UIName": "username", "Value": form.get('tgdb.username').value },
          { "Name": "", "UIName": "password", "Value": form.get('tgdb.password').value }
        ]
      }

    }
    else if (dataStore = "Dgraph") {

      dataStoreObj = {
        "Type": "datastore",
        "Name": dataStore,
        "Properties": [
          { "Name": "GraphBuilder_dgraph.IoTDgraph.Dgraph_Server_URL", "UIName": "url", "Value": form.get('dgraph.url').value },
          { "Name": "GraphBuilder_dgraph.IoTDgraph.Username", "UIName": "username", "Value": form.get('dgraph.username').value },
          { "Name": "GraphBuilder_dgraph.IoTDgraph.Password", "UIName": "password", "Value": form.get('dgraph.password').value }
        ]
      };

    };

    return dataStoreObj;
  }
}
