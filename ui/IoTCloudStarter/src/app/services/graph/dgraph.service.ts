import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';

import { Gateway, Subscription, Rule, Notification } from '../../shared/models/iot.model';
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
    let query = `{
      resp(func: has(gateway)) {
        uid uuid description address latitude longitude accessToken createdts updatedts
      }
    }`;

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Gateway[]),
        tap(_ => this.logger.info('fetched gateways')),
        catchError(this.handleError<Gateway[]>('getGateways', []))
      );
  }

  updateGateway(gateway: Gateway): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      set {
        <${gateway.uid}> <address> "${gateway.address}" .
        <${gateway.uid}> <description> "${gateway.description}" .
        <${gateway.uid}> <latitude> "${gateway.latitude}" .
        <${gateway.uid}> <longitude> "${gateway.longitude}" .
        <${gateway.uid}> <accessToken> "${gateway.accessToken}" .
        <${gateway.uid}> <updatedts> "${gateway.updatedts}" .
      }
    }`;
    console.log('Update Gateway Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('updated gateway')),
        catchError(this.handleError<string>('updateGateway'))
      );
  }

  addGateway(gateway: Gateway): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      set {
        _:Gateway <gateway> "" .
        _:Gateway <type> "gateway" .
        _:Gateway <uuid> "${gateway.uuid}" .
        _:Gateway <description> "${gateway.description}" .
        _:Gateway <address> "${gateway.address}" .
        _:Gateway <latitude> "${gateway.latitude}" .
        _:Gateway <longitude> "${gateway.longitude}" .
        _:Gateway <accessToken> "${gateway.accessToken}" .
        _:Gateway <createdts> "${gateway.createdts}" .
        _:Gateway <updatedts> "${gateway.updatedts}" .
      }
    }`;
    console.log('Add Gateway Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('add gateway')),
        catchError(this.handleError<string>('addGateway'))
      );
  }

  deleteGateway(gatewayUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      delete {
        <${gatewayUid}> * * .
      }
    }`;
    console.log('Delete Gateway Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted gateway')),
        catchError(this.handleError<string>('deleteGateway'))
      );
  }

  getGatewayAndSubscriptions(gatewayName): Observable<Gateway[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid description address latitude longitude accessToken createdts updatedts
        subscriptions: gateway_subscription {
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
          publisher
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
      }
    }`;
    console.log('Get Gateway and Subscriptions query statement: ', query);

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Gateway[]),
        tap(_ => this.logger.info('fetched Gateway')),
        catchError(this.handleError<Gateway[]>('getGatewayWithSubscriptions', []))
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
        publisher
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

  addSubscription(gatewayUid: number, subscription: Subscription): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      set {
        _:Subscription <name> "${subscription.name}" .
        _:Subscription <uuid> "${subscription.name}" .
        _:Subscription <type> "subscription" .
        _:Subscription <subscription> "" .
        _:Subscription <port> "${subscription.port}" .
        _:Subscription <user> "${subscription.user}" .
        _:Subscription <path> "${subscription.path}" .
        _:Subscription <enabled> "${subscription.enabled}" .
        _:Subscription <encryptionAlgorithm> "${subscription.encryptionAlgorithm}" .
        _:Subscription <method> "${subscription.method}" .
        _:Subscription <valueDescriptorFilter> "${subscription.valueDescriptorFilter}" .
        _:Subscription <consumer> "${subscription.consumer}" .
        _:Subscription <publisher> "${subscription.publisher}" .
        _:Subscription <destination> "${subscription.destination}" .
        _:Subscription <protocol> "${subscription.protocol}" .
        _:Subscription <compression> "${subscription.compression}" .
        _:Subscription <password> "${subscription.password}" .
        _:Subscription <deviceIdentifierFilter> "${subscription.deviceIdentifierFilter}" .
        _:Subscription <initializingVector> "${subscription.initializingVector}" .
        _:Subscription <origin> "${subscription.origin}" .
        _:Subscription <created> "${subscription.created}" .
        _:Subscription <modified> "${subscription.modified}" .
        _:Subscription <topic> "${subscription.topic}" .
        _:Subscription <format> "${subscription.format}" .
        _:Subscription <address> "${subscription.address}" .
        _:Subscription <encryptionKey> "${subscription.encryptionKey}" .
        <${gatewayUid}> <gateway_subscription> _:Subscription .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('add subscriptions')),
        catchError(this.handleError<string>('addSubscriptions'))
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
        <${subscription.uid}> <publisher> "${subscription.publisher}" .
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

  deleteSubscription(gatewayUid: number, subscriptionUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      delete {
        <${subscriptionUid}> * * .
        <${gatewayUid}> <gateway_subscription> <${subscriptionUid}> .
      }
    }`;
    console.log('Delete Subscription Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted subscription')),
        catchError(this.handleError<string>('deleteSubscription'))
      );
  }

  getRules(gatewayName): Observable<Rule[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        rules as gateway_rule {
        }
      }
      resp(func: uid(rules)) {
        uid
        name
        uuid
        description
        conditionDevice
        conditionResource
        conditionCompareToValue
        conditionCompareToValueOperation
        conditionValue
        conditionCompareToLastValue
        conditionCompareToLastValueOperation
        actionSendNotification
        actionNotification
        actionSendCommand
        actionDevice
        actionResource
        actionValue
        created
        modified
      }
    }`;

    console.log("getRules service query: ", query)

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Rule[]),
        tap(_ => this.logger.info('fetched rules')),
        catchError(this.handleError<Rule[]>('getRules', []))
      );

  }

  addRule(gatewayUid: number, rule: Rule): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      set {
        _:Rule <name> "${rule.name}" .
        _:Rule <uuid> "${rule.name}" .
        _:Rule <type> "rule" .
        _:Rule <rule> "" .
        _:Rule <description> "${rule.description}" .
        _:Rule <conditionDevice> "${rule.conditionDevice}" .
        _:Rule <conditionResource> "${rule.conditionResource}" .
        _:Rule <conditionCompareToValue> "${rule.conditionCompareToValue}" .
        _:Rule <conditionCompareToValueOperation> "${rule.conditionCompareToValueOperation}" .
        _:Rule <conditionValue> "${rule.conditionValue}" .
        _:Rule <conditionCompareToLastValue> "${rule.conditionCompareToLastValue}" .
        _:Rule <conditionCompareToLastValueOperation> "${rule.conditionCompareToLastValueOperation}" .
        _:Rule <actionSendNotification> "${rule.actionSendNotification}" .
        _:Rule <actionNotification> "${rule.actionNotification}" .
        _:Rule <actionSendCommand> "${rule.actionSendCommand}" .
        _:Rule <actionDevice> "${rule.actionDevice}" .
        _:Rule <actionResource> "${rule.actionResource}" .
        _:Rule <actionValue> "${rule.actionValue}" .
        _:Rule <created> "${rule.created}" .
        _:Rule <modified> "${rule.modified}" .
        <${gatewayUid}> <gateway_rule> _:Rule .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('add rule')),
        catchError(this.handleError<string>('addRule'))
      );

  }

  updateRule(rule: Rule): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      set {
        <${rule.uid}> <name> "${rule.name}" .
        <${rule.uid}> <uuid> "${rule.uuid}" .
        <${rule.uid}> <description> "${rule.description}" .
        <${rule.uid}> <conditionDevice> "${rule.conditionDevice}" .
        <${rule.uid}> <conditionResource> "${rule.conditionResource}" .
        <${rule.uid}> <conditionCompareToValue> "${rule.conditionCompareToValue}" .
        <${rule.uid}> <conditionCompareToValueOperation> "${rule.conditionCompareToValueOperation}" .
        <${rule.uid}> <conditionValue> "${rule.conditionValue}" .
        <${rule.uid}> <conditionCompareToLastValue> "${rule.conditionCompareToLastValue}" .
        <${rule.uid}> <conditionCompareToLastValueOperation> "${rule.conditionCompareToLastValueOperation}" .
        <${rule.uid}> <actionSendNotification> "${rule.actionSendNotification}" .
        <${rule.uid}> <actionNotification> "${rule.actionNotification}" .
        <${rule.uid}> <actionSendCommand> "${rule.actionSendCommand}" .
        <${rule.uid}> <actionDevice> "${rule.actionDevice}" .
        <${rule.uid}> <actionResource> "${rule.actionResource}" .
        <${rule.uid}> <actionValue> "${rule.actionValue}" .
        <${rule.uid}> <modified> "${rule.modified}" .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('updated rule')),
        catchError(this.handleError<string>('updateRule'))
      );

  }

  deleteRule(gatewayUid: number, ruleUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate`;
    let query = `{
      delete {
        <${ruleUid}> * * .
        <${gatewayUid}> <gateway_rule> <${ruleUid}> .
      }
    }`;
    console.log('Delete Rule Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted rule')),
        catchError(this.handleError<string>('deleteRule'))
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
      resp(func: uid(readings), orderasc:created) {
        created
        value
      }
    }`;

    console.log('Reading query statement: ', query);

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
      resp(func: uid(readings), orderasc:created) {
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
      resp(func: uid(readings), orderasc:created) {
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

  getNotifications(): Observable<Notification[]> {
    console.log("GetNotifications service called")
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      resp(func: has(notification)) @normalize {
        uid uuid:uuid created:created notifySource:notifySource notifyDevice:notifyDevice notifyResource:notifyResource notifyLevel:notifyLevel value:value description:description ~gateway_notification {
          gateway: uuid
        }
      }
    }`;

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Notification[]),
        tap(response => console.log("Response from GetNoti: ", response)),
        tap(_ => this.logger.info('fetched notifications')),
        catchError(this.handleError<Notification[]>('getNotifications', []))
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
