import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Profile, Resource, ResourceProperty, ResourceAttribute, Gateway, PropertyValue, PropertyUnit } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { DgraphService } from '../../services/graph/dgraph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { longStackSupport } from 'q';

interface ResourceNode {
  name: string;
  id: string;
}
interface ProfileNode {
  name: string;
  id: string;
  deviceResources?: ResourceNode[];
}


@Component({
  selector: 'app-iot-device-profile',
  templateUrl: './iot-device-profile.component.html',
  styleUrls: ['./iot-device-profile.component.css']
})
export class IotDeviceProfileComponent implements OnInit {
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'
  showResourceDetail = false;
  gatewayList: Gateway[] = [];
  gatewaySelected: Gateway = null;

  profileList: Profile[] = [];
  profileNodeList: ProfileNode[] = [];

  lastProfileId = "";
  lastResourceName = "";

  // Form variables
  detailsForm: FormGroup;
  activeNode;

  treeControl = new NestedTreeControl<ProfileNode>(node => node.deviceResources);
  deviceProfilesDataSource = new MatTreeNestedDataSource<ProfileNode>();


  constructor(private edgeService: EdgeService,
    private graphService: DgraphService,
    private formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar) {

    this.detailsForm = this.formBuilder.group({
      profileName: ['', Validators.required],
      profileManufacturer: [''],
      profileModel: [''],
      profileDescription: [''],
      profileCreated: [''],
      profileModified: [''],
      resourceName: ['', Validators.required],
      resourceDescription: [''],
      valueType: ['', Validators.required],
      valueReadWrite: [''],
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
    this.getGateways();
  }

  hasChild = (_: number, node: Profile) => !!node.deviceResources && node.deviceResources.length > 0;


  addNewProfile(node) {

    this.showResourceDetail = true;

    let tsms = Date.now();
    let ts = new Number(tsms);

    let deviceResources = [];
    let deviceResource = {
      name: "NewResource",
      id: ts.toString()
    }

    deviceResources.push(deviceResource);

    let profileNode = {
      name: "NewProfileName",
      id: ts.toString(),
      deviceResources: deviceResources
    }

    this.profileNodeList.push(
      profileNode
    );

    this.treeControl.expand(profileNode);

    this.deviceProfilesDataSource.data = null;
    this.deviceProfilesDataSource.data = this.profileNodeList;

    // Update details form
    this.detailsForm.patchValue({

      profileName: profileNode.name,
      profileManufacturer: "",
      profileModel: "",
      profileDescription: "",
      profileCreated: this._datePipe.transform(tsms, this.dateFormat),
      profileModified: this._datePipe.transform(tsms, this.dateFormat),

      resourceName: "NewResourceName",
      resourceDescription: "",
      valueType: "INT16",
      valueReadWrite: "R",
      valueMinimum: "0",
      valueMaximum: "0",
      valueDefault: "0",
      valueUnit: "unit",
      interface: "N/A",
      interfacePinNumber: "N/A",
      interfaceType: "N/A"
    });


    console.log("Adding profile final: ", this.profileNodeList);

    this.lastProfileId = profileNode.id;
    this.lastResourceName = deviceResource.name;

  }

  /** Select the category so we can insert the new item. */
  addNewInstrument(node: ProfileNode) {

    console.log("Adding new instrument to node: ", node);

    let deviceResource = {
      name: "NewResourceName",
      id: node.id
    };
    node.deviceResources.push(deviceResource);

    this.treeControl.expand(node);

    this.refreshTree();

    this.showResourceDetail = true;

    let profile = this.getProfile(node.id);

    // Update details form
    this.detailsForm.patchValue({

      profileName: profile.name,
      profileManufacturer: profile.manufacturer,
      profileModel: profile.model,
      profileDescription: profile.description,
      profileCreated: this._datePipe.transform(profile.created, this.dateFormat),
      profileModified: this._datePipe.transform(profile.modified, this.dateFormat),

      resourceName: "NewResourceName",
      resourceDescription: "",
      valueType: "INT16",
      valueReadWrite: "R",
      valueMinimum: "0",
      valueMaximum: "0",
      valueDefault: "0",
      valueUnit: "unit",
      interface: "N/A",
      interfacePinNumber: "N/A",
      interfaceType: "N/A"
    });

    this.lastProfileId = node.id;
    this.lastResourceName = deviceResource.name;


  }

  refreshTree() {
    let _data = this.deviceProfilesDataSource.data;
    this.deviceProfilesDataSource.data = null;
    this.deviceProfilesDataSource.data = _data;
  }


  profileSelected(node: ProfileNode) {
    console.log("Profile selected: ", node);

    this.showResourceDetail = false;

    let profile = this.getProfile(node.id);

    // Update details form
    this.detailsForm.patchValue({
      profileName: profile.name,
      profileManufacturer: profile.manufacturer,
      profileModel: profile.model,
      profileDescription: profile.description,
      profileCreated: this._datePipe.transform(profile.created, this.dateFormat),
      profileModified: this._datePipe.transform(profile.modified, this.dateFormat)
    });

    this.lastProfileId = node.id;
    this.lastResourceName = "";


  }

  instrumentSelected(node: ResourceNode) {
    console.log("Instrument selected: ", node);

    this.showResourceDetail = true;

    let profile = this.getProfile(node.id);

    let resource = this.getResource(profile, node.name);

    console.log("Returned profile node: ", profile);

    // Update details form

    let attrInterface = '';
    let attrPinNum = '';
    let attrType = '';
    if (resource.attributes != undefined) {
      attrInterface = resource.attributes.Interface;
      attrPinNum = resource.attributes.Pin_Num;
      attrType = resource.attributes.Type;
    }

    this.detailsForm.patchValue({

      profileName: profile.name,
      profileManufacturer: profile.manufacturer,
      profileModel: profile.model,
      profileDescription: profile.description,
      profileCreated: this._datePipe.transform(profile.created, this.dateFormat),
      profileModified: this._datePipe.transform(profile.modified, this.dateFormat),

      resourceName: resource.name,
      resourceDescription: resource.description,
      valueType: resource.properties.value.type,
      valueReadWrite: resource.properties.value.readWrite,
      valueMinimum: resource.properties.value.minimum,
      valueMaximum: resource.properties.value.maximum,
      valueDefault: resource.properties.value.defaultValue,
      valueUnit: resource.properties.units.defaultValue,
      interface: attrInterface,
      interfacePinNumber: attrPinNum,
      interfaceType: attrType
    });

    this.lastProfileId = node.id;
    this.lastResourceName = node.name;

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
    this.getProfiles(this.gatewaySelected);

  }

  getProfiles(gateway) {
    this.profileList = [];
    this.profileNodeList = [];
    this.edgeService.getProfiles(gateway)
      .subscribe(res => {
        this.profileList = res as Profile[];

        console.log("Profiles Returned in getProfiles: ", res);

        // Add profile to profile node list
        res.forEach((prof, index) => {

          let resources = [];
          prof.deviceResources.forEach((dv) => {
            resources.push({
              name: dv.name,
              id: prof.id
            })
          });

          // Add resources
          this.profileNodeList.push({
            name: prof.name,
            id: prof.id,
            deviceResources: resources
          });
        });
        console.log("Updated profile list: ", this.profileList);
        console.log("updated profile node list: ", this.profileNodeList);

        this.deviceProfilesDataSource.data = null;
        this.deviceProfilesDataSource.data = this.profileNodeList;
      })
  }

  saveProfile() {
    console.log("Saving Profile");

    let profileNode = this.getProfileNode(this.lastProfileId);
    if (profileNode != null) {
      profileNode.name = this.detailsForm.controls['profileName'].value;
    }

    let resourceNode = this.getResourceNode(profileNode, this.lastResourceName);
    if (resourceNode != null) {
      resourceNode.name = this.detailsForm.controls['resourceName'].value;
    }

    let profile = this.getProfile(this.lastProfileId);

    // If existing profile
    if (profile != null) {

      profile.name = this.detailsForm.controls['profileName'].value;
      profile.manufacturer = this.detailsForm.controls['profileManufacturer'].value;
      profile.model = this.detailsForm.controls['profileModel'].value;
      profile.description = this.detailsForm.controls['profileDescription'].value;

      // For non-empty resources
      if (this.lastResourceName != "") {


        let resource = this.getResource(profile, this.lastResourceName);

        // If existing resource
        if (resource != null) {
          resource.name = this.detailsForm.controls['resourceName'].value;
          resource.description = this.detailsForm.controls['resourceDescription'].value;
          resource.properties.value.type = this.detailsForm.controls['valueType'].value;
          resource.properties.value.readWrite = this.detailsForm.controls['valueReadWrite'].value;
          resource.properties.value.minimum = this.detailsForm.controls['valueMinimum'].value;
          resource.properties.value.maximum = this.detailsForm.controls['valueMaximum'].value;
          resource.properties.value.defaultValue = this.detailsForm.controls['valueDefault'].value;
          resource.properties.units.defaultValue = this.detailsForm.controls['valueUnit'].value;
          resource.attributes.Interface = this.detailsForm.controls['interface'].value;
          resource.attributes.Pin_Num = this.detailsForm.controls['interfacePinNumber'].value;
          resource.attributes.Type = this.detailsForm.controls['interfaceType'].value;
        }
        // New non empty resource
        else {
          let value: PropertyValue = {
            type: this.detailsForm.controls['valueType'].value,
            readWrite: this.detailsForm.controls['valueReadWrite'].value,
            minimum: this.detailsForm.controls['valueMinimum'].value,
            maximum: this.detailsForm.controls['valueMaximum'].value,
            defaultValue: this.detailsForm.controls['valueDefault'].value,
            size: "",
            word: "",
            lsb: "",
            mask: "",
            shift: "",
            scale: "",
            offset: "",
            base: "",
            assertion: "",
            signed: "",
            precision: ""
          };

          let units: PropertyUnit = {
            type: "",
            readWrite: "",
            defaultValue: this.detailsForm.controls['valueUnit'].value
          };

          let properties: ResourceProperty = {
            value: value,
            units: units
          };

          let attributes = {
            Interface: this.detailsForm.controls['interface'].value,
            Pin_Num: this.detailsForm.controls['interfacePinNumber'].value,
            Type: this.detailsForm.controls['interfaceType'].value
          };

          let resource: Resource = {
            name: this.detailsForm.controls['resourceName'].value,
            description: this.detailsForm.controls['resourceDescription'].value,
            tag: "",
            properties: properties,
            attributes: attributes
          };

          profile.deviceResources.push(resource);

        }

      }

      // Update profile in EdgeX
      this.edgeService.updateProfile(this.gatewaySelected, profile)
        .subscribe(res => {
          console.log("Result from update profile: ", res);

          let message = 'Success';
          if (res == undefined) {
            message = 'Failure';
          }

          this._snackBar.open(message, "Update Profile", {
            duration: 3000,
          });

          this.getProfiles(this.gatewaySelected);

        });

    }
    // New profile
    else {

      let tsms = Date.now();

      let value: PropertyValue = {
        type: this.detailsForm.controls['valueType'].value,
        readWrite: this.detailsForm.controls['valueReadWrite'].value,
        minimum: this.detailsForm.controls['valueMinimum'].value,
        maximum: this.detailsForm.controls['valueMaximum'].value,
        defaultValue: this.detailsForm.controls['valueDefault'].value,
        size: "",
        word: "",
        lsb: "",
        mask: "",
        shift: "",
        scale: "",
        offset: "",
        base: "",
        assertion: "",
        signed: "",
        precision: ""
      };

      let units: PropertyUnit = {
        type: "",
        readWrite: "",
        defaultValue: this.detailsForm.controls['valueUnit'].value
      };

      let properties: ResourceProperty = {
        value: value,
        units: units
      };

      let attributes = {
        Interface: this.detailsForm.controls['interface'].value,
        Pin_Num: this.detailsForm.controls['interfacePinNumber'].value,
        Type: this.detailsForm.controls['interfaceType'].value
      };

      let resource: Resource = {
        name: this.detailsForm.controls['resourceName'].value,
        description: this.detailsForm.controls['resourceDescription'].value,
        tag: "",
        properties: properties,
        attributes: attributes
      };

      let resources = [];
      resources.push(resource);

      let profile: Profile = {
        created: tsms,
        modified: tsms,
        name: this.detailsForm.controls['profileName'].value,
        description: this.detailsForm.controls['profileDescription'].value,
        id: "",
        manufacturer: this.detailsForm.controls['profileManufacturer'].value,
        model: this.detailsForm.controls['profileModel'].value,
        deviceResources: resources,
        deviceCommands: []
      };

      // Add profile to EdgeX
      this.edgeService.addProfile(this.gatewaySelected, profile)
        .subscribe(res => {
          console.log("Result from add profile: ", res);

          let message = 'Success';
          if (res == undefined) {
            message = 'Failure';
          }

          this._snackBar.open(message, "Add Profile", {
            duration: 3000,
          });

          this.getProfiles(this.gatewaySelected);

        });

    }

  }

  /* Get the profile node given the id */
  getProfile(id: string): Profile | null {

    console.log("In get parent node");

    let searching = true;
    let profile = null;
    for (let i = 0; i < this.profileList.length && searching; i++) {

      if (this.profileList[i].id == id) {
        profile = this.profileList[i];
        searching = false;
      }

    }

    console.log("Profile Node: ", profile);

    return profile;
  }

  /* Get the resource node given the name */
  getResource(profile: Profile, name: string): Resource | null {

    let searching = true;
    let resource = null;
    for (let i = 0; i < profile.deviceResources.length && searching; i++) {

      if (profile.deviceResources[i].name == name) {
        resource = profile.deviceResources[i];
        searching = false;
      }

    }

    return resource;
  }


  /* Get the profile node given the id */
  getProfileNode(id: string): ProfileNode | null {

    let searching = true;
    let profileNode = null;
    for (let i = 0; i < this.profileNodeList.length && searching; i++) {

      if (this.profileNodeList[i].id == id) {
        profileNode = this.profileNodeList[i];
        searching = false;
      }

    }

    return profileNode;
  }

  getResourceNode(profileNode: ProfileNode, name: string): ResourceNode | null {

    let searching = true;
    let resourceNode = null;
    for (let i = 0; i < profileNode.deviceResources.length && searching; i++) {

      if (profileNode.deviceResources[i].name == name) {
        resourceNode = profileNode.deviceResources[i];
        searching = false;
      }

    }

    return resourceNode;
  }

}
