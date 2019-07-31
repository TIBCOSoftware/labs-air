import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';

import { Device, Profile, Service, Subscription, GetCommandResponse } from '../../shared/models/iot.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const httpTextResponseOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  observe: 'body' as 'body',
  responseType: 'text' as 'json'
};

@Injectable({
  providedIn: 'root'
})
export class EdgeService {

  // EdgeX service urls are proxied in the proxy.conf.prod.* files
  private edgeCoreMetadataUrl = '/coremeta/api/v1/';
  private edgeCoreDataUrl = '/coredata/api/v1/';
  private edgeCoreCommandUrl = '/corecommand/api/v1/';
  private edgeExportClientUrl = '/exportclient/api/v1/';
  private edgeExportDistroUrl = '/exportdistro/api/v1/';

  constructor(private http: HttpClient,
    private logger: LogService) {
    logger.level = LogLevel.Debug;
  }


  // Core Metadata Operations
  // URL: http://localhost:48081/api/v1

  getDevices(): Observable<Device[]> {
    const url = `${this.edgeCoreMetadataUrl}device`;

    console.log("GetDevices service called for url:", url);

    return this.http.get<Device[]>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info('fetched devices')),
        catchError(this.handleError<Device[]>('getDevices', []))
      );
  }

  getDevicesTestOld() {
    const url = `${this.edgeCoreMetadataUrl}device`;

    console.log("GetDevices service test called for url:", url);

    this.http.get(url, httpOptions)
      .subscribe(
        (val) => {
          console.log("GET call successful value returned in body",
            val);
        },
        response => {
          console.log("POST call in error", response);
        },
        () => {
          console.log("The POST observable is now completed.");
        });
  }

  getDevicesTest() {
    const url = `${this.edgeCoreMetadataUrl}device`;

    console.log("GetDevices service test called for url:", url);


    this.http.get(url, httpOptions)
      .subscribe(
        (val) => {
          console.log("GET call successful value returned in body",
            val);
        },
        response => {
          console.log("POST call in error", response);
        },
        () => {
          console.log("The POST observable is now completed.");
        });
  }

  getDevice(id: string): Observable<Device> {
    const url = `${this.edgeCoreMetadataUrl}device/${id}`;
    return this.http.get<Device>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info(`fetched device id=${id}`)),
        catchError(this.handleError<Device>(`getDevice id=${id}`))
      );
  }

  addDevice(device: any): Observable<String> {
    const url = `${this.edgeCoreMetadataUrl}device`;

    return this.http.post<string>(url, device, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('added new device')),
        catchError(this.handleError<string>('addDevice'))
      );
  }

  deleteDeviceByName(deviceName: string): Observable<String> {
    const url = `${this.edgeCoreMetadataUrl}device/${deviceName}`;

    return this.http.delete<string>(url, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('added new device')),
        catchError(this.handleError<string>('addDevice'))
      );
  }

  getProfiles(): Observable<Profile[]> {
    const url = `${this.edgeCoreMetadataUrl}deviceprofile`;

    console.log("GetProfiles service called for url:", url);

    return this.http.get<Profile[]>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info('fetched profiles')),
        catchError(this.handleError<Profile[]>('getProfiles', []))
      );
  }

  getServices(): Observable<Service[]> {
    const url = `${this.edgeCoreMetadataUrl}deviceservice`;

    console.log("GetServices service called for url:", url);

    return this.http.get<Service[]>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info('fetched services')),
        catchError(this.handleError<Service[]>('getServices', []))
      );
  }

  // Core Command Operations
  // URL: http://localhost:48082/api/v1

  getCommand(cmdPath: string): Observable<GetCommandResponse> {
    let url = `${this.edgeCoreCommandUrl}${cmdPath}`

    console.log("Get command Url: ", url);
    return this.http.get<GetCommandResponse>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info(`fetched get response`)),
        catchError(this.handleError<GetCommandResponse>(`getCommand response`))
      );

  }

  // Export Client Operations
  // URL: http://localhost:48071/api/v1

  addRegisteration(subscription: Subscription): Observable<String> {
    const url = `${this.edgeExportClientUrl}registration`;

    let deviceFilter = [];
    if (subscription.deviceIdentifierFilter.length > 0) {
      let dfilter = subscription.deviceIdentifierFilter.replace(/\s+/g, '');
      deviceFilter = dfilter.split(',');
    }

    let valueDescriptorFilter = [];
    if (subscription.valueDescriptorFilter.length > 0) {
      let vdfilter = subscription.valueDescriptorFilter.replace(/\s+/g, '');
      valueDescriptorFilter = vdfilter.split(',');
    }

    let query = {
      "origin": subscription.origin,
      "name": subscription.name,
      "addressable": {
        "origin": subscription.origin,
        "name": subscription.name,
        "protocol": subscription.protocol,
        "method": subscription.method,
        "address": subscription.address,
        "port": subscription.port,
        "path": subscription.path
      },
      "filter": {
        "deviceIdentifiers": deviceFilter,
        "valueDescriptorIdentifiers": valueDescriptorFilter
      },
      "encryption": {
        "encryptionAlgorith": subscription.encryptionAlgorithm,
        "encryptionKey": "",
        "initializingVector": ""
      },
      "compression": subscription.compression,
      "format": subscription.format,
      "enable": subscription.enabled,
      "destination": subscription.destination
    }

    return this.http.post<string>(url, query, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }

  updateRegisteration(subscription: Subscription): Observable<string> {
    const url = `${this.edgeExportClientUrl}registration`;

    let deviceFilter = [];
    if (subscription.deviceIdentifierFilter.length > 0) {
      let dfilter = subscription.deviceIdentifierFilter.replace(/\s+/g, '');
      deviceFilter = dfilter.split(',');
    }

    let valueDescriptorFilter = [];
    if (subscription.valueDescriptorFilter.length > 0) {
      let vdfilter = subscription.valueDescriptorFilter.replace(/\s+/g, '');
      valueDescriptorFilter = vdfilter.split(',');
    }

    let query = {
      "name": subscription.name,
      "addressable": {
        "name": subscription.name,
        "protocol": subscription.protocol,
        "method": subscription.method,
        "address": subscription.address,
        "port": subscription.port,
        "path": subscription.path
      },
      "filter": {
        "deviceIdentifiers": deviceFilter,
        "valueDescriptorIdentifiers": valueDescriptorFilter
      },
      "encryption": {
        "encryptionAlgorith": subscription.encryptionAlgorithm,
        "encryptionKey": "",
        "initializingVector": ""
      },
      "compression": subscription.compression,
      "format": subscription.format,
      "enable": subscription.enabled,
      "destination": subscription.destination
    }

    return this.http.put<string>(url, query, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }

  deleteRegisteration(subscriptionName: string): Observable<string> {
    const url = `${this.edgeExportClientUrl}registration/name/${subscriptionName}`;

    return this.http.delete<string>(url)
      .pipe(
        tap(_ => this.logger.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }



  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error('Inside the handleError function');
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.logger.info(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
