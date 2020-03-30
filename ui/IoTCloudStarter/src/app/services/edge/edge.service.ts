import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';

import { Device, Profile, Service, Subscription, GetCommandResponse, Gateway, Rule } from '../../shared/models/iot.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer XXXXXXXXXXXXXXXXXXXXXXXX'
  })
};

const httpTextResponseOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer XXXXXXXXXXXXXXXXXXXXXXXX'
  }),
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
  private edgeFlogoRulesUrl = '/flogorules/api/v1/'

  private gatewayCoreMetadataPath = '/edgexgateway/metadata/api/v1';
  private gatewayCoreDataPath = '/edgexgateway/coredata/api/v1';
  private gatewayCoreCommandPath = '/edgexgateway/command/api/v1';
  private gatewayExportClientPath = '/edgexgateway/export/api/v1';
  private gatewayExportDistroPath = '/edgexgateway/distro/api/v1';

  constructor(private http: HttpClient,
    private logger: LogService) {
    logger.level = LogLevel.Debug;
  }


  // Core Metadata Operations
  // URL: http://localhost:48081/api/v1

  pingCoreMetadata(gateway: Gateway): Observable<string> {

    // const url1 = `https://localhost:8443/metadata/api/v1/ping`;
    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/ping`;

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.get<string>(url, httpTextResponseOptions)
      .pipe(
        timeout(2000),
        tap(_ => this.logger.info('received ping response')),
        catchError(this.handleError<string>('pingGateway'))
      );
  }

  pingCoreMetadataUnauthorized(gateway: string): Observable<string> {

    const url = `/${gateway}${this.edgeCoreMetadataUrl}ping`;

    console.log("In PingCoreMetadata with url: ", url);

    return this.http.get<string>(url, httpTextResponseOptions)
      .pipe(
        timeout(2000),
        tap(_ => this.logger.info('received ping response')),
        catchError(this.handleError<string>('pingGateway'))
      );
  }

  getDevices(gateway: Gateway): Observable<Device[]> {
    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/device`;
    console.log("GetDevices service called for url:", url);

    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<Device[]>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info('fetched devices')),
        catchError(this.handleError<Device[]>('getDevices', []))
      );
  }

  getDevicesUnauthorized(gateway: string): Observable<Device[]> {
    const url = `/${gateway}${this.edgeCoreMetadataUrl}device`;

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

  getDevice(gateway: Gateway, id: string): Observable<Device> {
    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/device/${id}`;

    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<Device>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info(`fetched device id=${id}`)),
        catchError(this.handleError<Device>(`getDevice id=${id}`))
      );
  }

  addDevice(gateway: Gateway, device: any): Observable<String> {
    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/device`;

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, device, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('added new device')),
        catchError(this.handleError<string>('addDevice'))
      );
  }

  deleteDeviceByName(gateway: Gateway, deviceName: string): Observable<String> {
    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/device/name/${deviceName}`;

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.delete<string>(url, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('added new device')),
        catchError(this.handleError<string>('addDevice'))
      );
  }

  getProfiles(gateway: Gateway): Observable<Profile[]> {
    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/deviceprofile`;

    console.log("GetProfiles service called for url:", url);

    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<Profile[]>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info('fetched profiles')),
        catchError(this.handleError<Profile[]>('getProfiles', []))
      );
  }

  addProfile(gateway:Gateway, profile:Profile): Observable<string> {

    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/deviceprofile`;

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, profile, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('added new profile')),
        catchError(this.handleError<string>('addProfile'))
      );
  }

  updateProfile(gateway:Gateway, profile:Profile): Observable<string> {

    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/deviceprofile`;

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.put<string>(url, profile, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('updated profile')),
        catchError(this.handleError<string>('updateProfile'))
      );
  }

  getServices(gateway: Gateway): Observable<Service[]> {
    const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/deviceservice`;

    console.log("GetServices service called for url:", url);
    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<Service[]>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info('fetched services')),
        catchError(this.handleError<Service[]>('getServices', []))
      );
  }

  // Core Command Operations
  // URL: http://localhost:48082/api/v1

  getCommand(gateway: Gateway, cmdPath: string): Observable<GetCommandResponse> {
    const url = `/${gateway.uuid}${this.gatewayCoreCommandPath}/${cmdPath}`;
    
    console.log("Get command Url: ", url);
    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<GetCommandResponse>(url, httpOptions)
      .pipe(
        tap(_ => this.logger.info(`fetched get response`)),
        catchError(this.handleError<GetCommandResponse>(`getCommand response`))
      );

  }

  // Export Client Operations
  // URL: http://localhost:48071/api/v1

  addRegisteration(gateway: Gateway, subscription: Subscription): Observable<String> {
    const url = `/${gateway.uuid}${this.gatewayExportClientPath}/registration`;

    // const url = `https://localhost:8443/export/api/v1/registration`;

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
        "name": subscription.consumer,
        "publisher": subscription.publisher,
        "protocol": subscription.protocol,
        "method": subscription.method,
        "address": subscription.address,
        "port": subscription.port,
        "topic": subscription.topic,
        "path": subscription.path,
        "user": subscription.user,
        "password": subscription.password
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
    };

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, query, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }

  updateRegisteration(gateway: Gateway, subscription: Subscription): Observable<string> {
    const url = `/${gateway.uuid}${this.gatewayExportClientPath}/registration`;

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
        "name": subscription.consumer,
        "publisher": subscription.publisher,
        "protocol": subscription.protocol,
        "method": subscription.method,
        "address": subscription.address,
        "port": subscription.port,
        "path": subscription.path,
        "user": subscription.user,
        "password": subscription.password
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

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.put<string>(url, query, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }

  deleteRegisteration(gateway: Gateway, subscriptionName: string): Observable<string> {
    const url = `/${gateway.uuid}${this.gatewayExportClientPath}/registration/name/${subscriptionName}`;

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.delete<string>(url, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }

  addRule(gateway: Gateway, rule: Rule): Observable<string> {

    const url = `/${gateway.uuid}${this.edgeFlogoRulesUrl}addRule`;

    return this.http.post<string>(url, rule, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('added rule')),
        catchError(this.handleError<string>('addRule'))
      );
  }

  deleteRule(gateway: Gateway, rule: Rule): Observable<string> {

    const url = `/${gateway.uuid}${this.edgeFlogoRulesUrl}deleteRule`;

    return this.http.post<string>(url, rule, httpTextResponseOptions)
      .pipe(
        tap(_ => this.logger.info('added rule')),
        catchError(this.handleError<string>('addRule'))
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
