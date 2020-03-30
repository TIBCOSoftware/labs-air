import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DgraphService } from '../../../services/graph/dgraph.service';
import { Publisher } from '../../../shared/models/iot.model';
export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-protocols-view',
  templateUrl: './protocols-view.component.html',
  styleUrls: ['./protocols-view.component.css']
})
export class ProtocolsViewComponent implements OnInit {
  hidePassword = true;

  mqttProtocol = false;
  kafkaProtocol = false;
  httpProtocol = false;

  @Input() transportForm: FormGroup;

  constructor(private graphService: DgraphService) {

  }

  ngOnInit() {
    console.log("On Protocols ngOnInit. Getting publisher for: ", this.transportForm.get('gateway').value);

    // this.getPublishers(this.transportForm.get('gateway').value);


    this.onFormChanges();
  }

  onFormChanges(): void {
    this.transportForm.valueChanges.subscribe(val => {

      let protocol = this.transportForm.get('protocol').value;

      console.log("On ProtocolView form changed to protocol: ", protocol);

      this.mqttProtocol = false;
      this.kafkaProtocol = false;
      this.httpProtocol = false;

      if (protocol == "MQTT") {

        this.mqttProtocol = true;
      }
      else if (protocol == "Kafka") {

        this.kafkaProtocol = true;
      }
      else if (protocol == "HTTP") {
        this.httpProtocol = true;
      }
    });
  }

}
