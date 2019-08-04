import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';

import { Gateway, Subscription } from '../../shared/models/iot.model';
import { TSReading } from '../../shared/models/iot.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const httpMutateOptions = {
  headers: new HttpHeaders({ 'X-Dgraph-CommitNow': 'true' })
};

@Injectable({
  providedIn: 'root'
})
export class DgraphService {

  // Defined as a proxy.  (i.e. http://137.117.38.255:8080)
  private dgraphUrl = '/dgraph';

  constructor(private logger: LogService,
    private http: HttpClient) {

    logger.level = LogLevel.Debug;

  }

  getGateways(): Observable<Gateway[]> {
    console.log("GetGateways service called")
    const url = `${this.dgraphUrl}/query`;
    return this.http.post<any>(url, '{resp(func: has(gateway)) {uuid address latitude longitude createdts updatedts}}', httpOptions)
      .pipe(
        map(response => response.data.resp as Gateway[]),
        tap(_ => this.logger.info('fetched gateways')),
        catchError(this.handleError<Gateway[]>('getGateways', []))
      );
  }

  getSubscriptions(gatewayName): Observable<Subscription[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        subscriptions as gateway_subscription {
        }
      }
      resp(func: uid(subscriptions)) {
        uid
        name
        port
        uuid
        user
        path
        enabled
        encryptionAlgorithm
        method
        valueDescriptorFilter
        consumer
        destination
        protocol
        compression
        password
        deviceIdentifierFilter
        initializingVector
        origin
        created
        modified
        topic
        format
        address
        encryptionKey
      }
    }`;

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Subscription[]),
        tap(_ => this.logger.info('fetched subscriptions')),
        catchError(this.handleError<Subscription[]>('getSubscriptions', []))
      );

  }

  updateSubscription(subscription: Subscription): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      set {
        <${subscription.uid}> <port> "${subscription.port}" .
        <${subscription.uid}> <user> "${subscription.user}" .
        <${subscription.uid}> <path> "${subscription.path}" .
        <${subscription.uid}> <enabled> "${subscription.enabled}" .
        <${subscription.uid}> <encryptionAlgorithm> "${subscription.encryptionAlgorithm}" .
        <${subscription.uid}> <method> "${subscription.method}" .
        <${subscription.uid}> <valueDescriptorFilter> "${subscription.valueDescriptorFilter}" .
        <${subscription.uid}> <consumer> "${subscription.consumer}" .
        <${subscription.uid}> <destination> "${subscription.destination}" .
        <${subscription.uid}> <protocol> "${subscription.protocol}" .
        <${subscription.uid}> <compression> "${subscription.compression}" .
        <${subscription.uid}> <password> "${subscription.password}" .
        <${subscription.uid}> <deviceIdentifierFilter> "${subscription.deviceIdentifierFilter}" .
        <${subscription.uid}> <initializingVector> "${subscription.initializingVector}" .
        <${subscription.uid}> <modified> "${subscription.modified}" .
        <${subscription.uid}> <topic> "${subscription.topic}" .
        <${subscription.uid}> <format> "${subscription.format}" .
        <${subscription.uid}> <address> "${subscription.address}" .
        <${subscription.uid}> <encryptionKey> "${subscription.encryptionKey}" .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('updated subscriptions')),
        catchError(this.handleError<string>('updateSubscriptions'))
      );

  }

  getReadings(deviceName, instrumentName): Observable<TSReading[]> {
    const url = `${this.dgraphUrl}/query`;

    // return this.http.post<any>(url, `{resp(func: has(reading)) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) {~device_resource @filter (eq(uuid, "${deviceName}")) {}}}}`, httpOptions)
    // return this.http.post<any>(url, `{resp(func: has(reading)) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)

    let query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading (first:-300) {
        }
      }
      resp(func: uid(readings)) {
        created
        value
      }
    }`;
    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as TSReading[]),
        tap(_ => this.logger.info('fetched readings')),
        catchError(this.handleError<TSReading[]>('getReadings', []))
      );
  }

  getReadingsStartingAt(deviceName, instrumentName, fromts): Observable<TSReading[]> {
    const url = `${this.dgraphUrl}/query`;

    let myquery = `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`;
    let query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading @filter(gt(created, ${fromts})) {
        }
      }
      resp(func: uid(readings)) {
        created
        value
      }
    }`;

    console.log("the query is: ", query);

    // return this.http.post<any>(url, `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)
    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as TSReading[]),
        tap(_ => this.logger.info('fetched readings')),
        catchError(this.handleError<TSReading[]>('getReadings', []))
      );
  }

  getReadingsBetween(deviceName, instrumentName, fromts, tots): Observable<TSReading[]> {
    const url = `${this.dgraphUrl}/query`;

    let myquery = `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`;
    let query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading @filter(gt(created, ${fromts}) AND lt(created, ${tots})) (first:-500) {
        }
      }
      resp(func: uid(readings)) {
        created
        value
      }
    }`;

    console.log("the query is: ", query);

    // return this.http.post<any>(url, `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)
    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as TSReading[]),
        tap(_ => this.logger.info('fetched readings')),
        catchError(this.handleError<TSReading[]>('getReadings', []))
      );
  }


  /*
  * Handle Http operation that failed.
  * Let the app continue.
  * @param operation - name of the operation that failed
  * @param result - optional value to return as the observable result
  */
  private handleError<T>(operation = 'operation', result?: T) {
    console.log("Got an error.  Handling Error");

    return (error: any): Observable<T> => {

      console.log("Before error report");
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      console.log("After error report");

      // TODO: better job of transforming error for user consumption
      this.logger.info(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
