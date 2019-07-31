import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { Profile, Service, Device } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-iot-device-provision',
  templateUrl: './iot-device-provision.component.html',
  styleUrls: ['./iot-device-provision.component.css']
})
export class IotDeviceProvisionComponent implements OnInit, AfterViewInit {

  // Form variables
  hidePassword = true;
  provisionForm: FormGroup;

  deviceProfilesDataSource = new MatTableDataSource<Profile>();
  deviceServicesDataSource = new MatTableDataSource<Service>();

  profileList: SelectItem[] = [];

  serviceList: SelectItem[] = [];

  constructor(private edgeService: EdgeService,
    private formBuilder: FormBuilder) {

    this.provisionForm = this.formBuilder.group({
      deviceName: [''],
      description: [''],
      labels: [''],
      location: [''],
      protocolName: [''],
      protocolSchema: [''],
      protocolClientId: [''],
      protocolHost: [''],
      protocolPort: [''],
      protocolUser: [''],
      protocolPassword: [''],
      protocolTopic: [''],
      deviceProfile: [''],
      deviceService: [''],
    });

  }

  ngOnInit() {
    this.getProfiles();
    this.getServices();


  }

  ngAfterViewInit() {
    // this.deviceProfilesDataSource.sort = this.sort;
  }

  getProfiles() {
    this.edgeService.getProfiles()
      .subscribe(res => {
        this.deviceProfilesDataSource.data = res as Profile[];

        this.profileList = [];
        console.log("Profiles Returned: ", res);
        res.forEach((prof, index) => {
          this.profileList.push({
            value: prof.name,
            viewValue: prof.name
          });
        });
        console.log("Updated profile list: ", this.profileList);
      })
  }

  getServices() {
    this.edgeService.getServices()
      .subscribe(res => {
        this.deviceServicesDataSource.data = res as Service[];

        this.serviceList = [];
        console.log("Services Returned: ", res);
        res.forEach((serv, index) => {
          this.serviceList.push({
            value: serv.name,
            viewValue: serv.name
          });
        });
        console.log("Updated service list: ", this.serviceList);
      })
  }

  addDevice() {

    let labels = [];
    if (this.provisionForm.controls['labels'].value.length > 0) {
      let normLabels = this.provisionForm.controls['labels'].value.replace(/\s+/g, '');
      labels = normLabels.split(',');
    }

    // TODO: The creation of the device needs to be modified as the protocol
    // is specific for every device.  In this scenario, the protocol matches
    // what the mqtt device service is expecting.

    let device = {
      "name": this.provisionForm.controls['deviceName'].value,
      "description": this.provisionForm.controls['description'].value,
      "adminState": "unlocked",
      "operatingState": "enabled",
      "labels": labels,
      "location": this.provisionForm.controls['location'].value,
      "service": {
        "name": this.provisionForm.controls['deviceService'].value,
      },
      "profile": {
        "name": this.provisionForm.controls['deviceProfile'].value,
      },
      "protocols":{
        "protocol":{
          "Schema": this.provisionForm.controls['protocolSchema'].value,
          "ClientId": this.provisionForm.controls['protocolClientId'].value,
          "Host": this.provisionForm.controls['protocolHost'].value,
          "Port": this.provisionForm.controls['protocolPort'].value,
          "User": this.provisionForm.controls['protocolUser'].value,
          "Password": this.provisionForm.controls['protocolPassword'].value,
          "Topic": this.provisionForm.controls['protocolTopic'].value,
        }
      }
    }

    this.edgeService.addDevice(device)
      .subscribe(res => {
        console.log("Result from add device: ", res);
      });



  }

  deleteDevice() {
    let deviceName = this.provisionForm.controls['deviceName'].value;

    this.edgeService.deleteDeviceByName(deviceName)
      .subscribe(res => {
        console.log("Result from delete device: ", res);
      });
  }


}
