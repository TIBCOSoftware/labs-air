import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DgraphService } from '../../../services/graph/dgraph.service';
import { Publisher } from '../../../shared/models/iot.model';
export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-protocols',
  templateUrl: './protocols.component.html',
  styleUrls: ['./protocols.component.css']
})
export class ProtocolsComponent implements OnInit {

  hidePassword = true;

  mqttProtocol = false;
  kafkaProtocol = false;
  httpProtocol = false;

  publishers: Publisher[];

  kafkaAuthModes: SelectItem[] = [
    { value: 'None', viewValue: 'None' },
    { value: 'SASL/Plain', viewValue: 'SASL/Plain' },
    { value: 'SSL', viewValue: 'SSL' }
  ];

  kafkaInitialOffsets: SelectItem[] = [
    { value: 'Oldest', viewValue: 'Oldest' },
    { value: 'Newest', viewValue: 'Newest' }
  ];

  mqttEncriptionModes: SelectItem[] = [
    { value: 'None', viewValue: 'None' },
    { value: 'TLS-Cert', viewValue: 'TLS-Cert' },
    { value: 'TLS-ClientAuth', viewValue: 'TLS-ClientAuth' }
  ];

  @Input() transportForm: FormGroup;

  constructor(private graphService: DgraphService) {

  }

  ngOnInit() {
    console.log("On Protocols ngOnInit. Getting publisher for: ", this.transportForm.get('gateway').value);
    this.getPublishers(this.transportForm.get('gateway').value);

    this.onFormChanges();
  }

  public getPublishers(gatewayId: string) {
    console.log("Getting transports for: ", gatewayId);

    this.graphService.getPublishers(gatewayId)
      .subscribe(res => {
        console.log("Received response: ", res);
        this.publishers = res as Publisher[];

      })
  }


  onProtocolSelected(event) {
    console.log("Option selected: ", event);

    let publisher = this.publishers[event.value];

    console.log("Publisher selected protocol: ", publisher.protocol);

    this.mqttProtocol = false;
    this.kafkaProtocol = false;
    this.httpProtocol = false;

    if (publisher.protocol == "MQTT") {

      // Update transport Form
      this.transportForm.patchValue(
        {
          protocol: publisher.protocol,
          mqtt: {
            hostname: publisher.hostname,
            port: publisher.port,
            topic: publisher.topic,
            username: '',
            password: ''
          },
          kafka: {
            hostname: 'changeme',
            port: 'changeme',
            topic: 'changeme',
            username: 'changeme',
            password: 'changeme',
            consumerGroupId: 'changeme'
          }
        },
        { emitEvent: false }
      );

      this.mqttProtocol = true;
    }
    else if (publisher.protocol == "Kafka") {

      // Update transport Form
      this.transportForm.patchValue(
        {
          protocol: publisher.protocol,
          mqtt: {
            hostname: 'changeme',
            port: 'changeme',
            topic: 'changeme',
            username: 'changeme',
            password: 'changeme'
          },
          kafka: {
            hostname: publisher.hostname,
            port: publisher.port,
            topic: publisher.topic,
            username: '',
            password: '',
            consumerGroupId: ''
          }
        },
        { emitEvent: false }
      );

      this.kafkaProtocol = true;
    }
    else if (publisher.protocol == "HTTP") {
      this.httpProtocol = true;
    }

  }

  onKafkaAuthModeSelected(event) {
  }

  onMQTTEncryptionModeSelected(event) {
  }

  stepSubmitted() {
    // this.transportForm.get('transport').markAsTouched();
    // this.transportForm.get('transport').updateValueAndValidity();
    // this.transportForm.get('personalDetails').get('lastname').markAsTouched();
    // this.transportForm.get('personalDetails').get('lastname').updateValueAndValidity();
  }

  onFormChanges(): void {
    this.transportForm.valueChanges.subscribe(val => {
      console.log("TransportForm has changed for: ", val);

      // if (this.transportForm.dirty) {
      //   console.log("form is dirty");

      // }


      if (this.transportForm.get('protocol').value == "") {
        
        this.mqttProtocol = false;
        this.kafkaProtocol = false;
        this.httpProtocol = false;
      }

    });
  }

}
