import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { concat, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { MessageQueueService } from '@tibco-tcstk/tc-core-lib';
import { BusinessRule } from '../../shared/models/be.model'

@Injectable({
  providedIn: 'root'
})
export class BewsService {

  private globalToken = '';
  private globalRevisionID = '';

  private tceLocation = 'https://events.cloud.tibco.com';
  private liveAppsLocation = 'https://liveapps.cloud.tibco.com';
  // private  tceLocation = 'https://events.tenant-integration.tcie.pro';
  // private  liveAppsLocation = 'https://liveapps.tenant-integration.tcie.pro';

  // private proxy = 'https://events.tenant-integration.tcie.pro';
  // private  proxyPath = '/tce-proxy';
  private useProxy = true;
  private proxyPath = '/tce-proxy';
  private beProjectName = 'IoTRail';
  private beRulePath = '/BusinessRules/MyRule';
  private beImplementsPath = '/BusinessRules/CalculateShipping';


  private TokenURL = '';
  private ReAuthorizeURL = '';
  private saveURL = '';
  private commitURL = '';
  private genDeployURL = '';
  private publishURL = '';
  private checkoutURL = '';
  private projectsURL = '';

  constructor(private messageService: MessageQueueService, private http: HttpClient) {
    console.log('Deploy Rule Service Created, using proxy: ' + this.useProxy);
    if (!this.useProxy) {
      this.proxyPath = this.tceLocation;
      this.ReAuthorizeURL = this.liveAppsLocation + '/idm/v1/reauthorize';
    } else {
      this.ReAuthorizeURL = this.proxyPath + '/idm/v1/reauthorize';
    }
    this.TokenURL = this.proxyPath + '/ws/api/checkToken.json';
    console.log('    Proxy Path: ' + this.proxyPath);
    console.log('ReAuthorizeURL: ' + this.ReAuthorizeURL);
    console.log('      TokenURL: ' + this.TokenURL);
  }




  // Function to call the services to get TCE projects
  public getProjects(): Observable<any> {
    this.report('Getting Projects...');
    return concat(
      this.reAuthorize().pipe(
        switchMap(data => this.getNewCookie(data)),
        switchMap(() => this.getToken()),
        switchMap(() => this.projects()),
      ));
  }

  // Function to call the services to deploy a new business rulle
  public deployRule(bRule: BusinessRule): Observable<any> {
    this.report('Deploying New Business Rule...');
    return concat(
      this.reAuthorize().pipe(
        switchMap(data => this.getNewCookie(data)),
        switchMap(() => this.getToken()),
        switchMap(() => this.checkout()),
        switchMap(() => this.save(bRule)),
        switchMap(() => this.commit()),
        switchMap(() => this.generateDeploy()),
        switchMap(() => this.publish())
      ));
  }

  // Function to set the url's for the token
  private setTokenURLs() {
    console.log('Setting token URLS: ' + this.globalToken);
    this.projectsURL = this.proxyPath + '/ws/api/' + this.globalToken + '/projects.json';
    this.saveURL = this.proxyPath + '/ws/api/' + this.globalToken + '/artifact/save.json';
    this.commitURL = this.proxyPath + '/ws/api/' + this.globalToken + '/projects/' + this.beProjectName + '/commit.json';
    this.genDeployURL = this.proxyPath + '/ws/api/' + this.globalToken + '/projects/' + this.beProjectName + '/generateDeployable.json?buildClassesOnly=false';
    this.publishURL = this.proxyPath + '/ws/api/' + this.globalToken + '/worklist/statusChange.json';
    this.checkoutURL = this.proxyPath + '/ws/api/' + this.globalToken + '/projects/' + this.beProjectName + '/checkout.json';
    // https://events.cloud.tibco.com/ws/api/d163aef5e69445178c74e52e70640b81/projects/CustomerOfferManagement/checkout.json
    return of({ REPORT: 'Got API Token: ' + this.globalToken + '.' });
  }

  // Function to send message to the reporting queue
  private report(message) {
    this.messageService.sendMessage('report.queue', message);
    console.warn('Reporting: ' + message);
  }

  // Call 1) Re - Authorizing with TCE
  private reAuthorize() {
    this.report('Re-Authorizing...');
    const postForm = 'opaque-for-tenant=TCE';
    return this.callService(this.ReAuthorizeURL, 'POST', postForm, 'application/x-www-form-urlencoded').pipe(
      map((data) => {
        this.report('Re-Authorized.');
        return data;
      })
    );
  }

  // Call 2) Getting a new domain cookie for TCE tenant
  private getNewCookie(data) {
    // console.log('Getting Cookie ' , data);
    this.report('Getting new cookie for token...');
    const postForm = 'token=' + data.token;
    let cookieLocation = data.location;
    if (this.useProxy) {
      cookieLocation = data.location.replace('eu.events.cloud.tibco.com', 'localhost:4200' + this.proxyPath);
    }
    console.log('Cookie location: ', cookieLocation);
    return this.callService(cookieLocation, 'POST', postForm, 'application/x-www-form-urlencoded').pipe(
      map((dataC) => {
        this.report('Got new Cookie.');
        return dataC;
      })
    );
  }

  // Call 3) Getting API Token
  private getToken() {
    this.report('Getting API token...');
    return this.callService(this.TokenURL, 'GET', null, 'application/json').pipe(
      map(
        (tokenR) => {
          if (tokenR.response.status === '0') {
            this.globalToken = tokenR.response.data.record[0].apiToken;
            this.report('Got API Token: ' + this.globalToken + '.');
            this.setTokenURLs();
          } else {
            this.report('ERROR STATUS: ' + tokenR.response.data);
            throw new Error('ERROR STATUS: ' + tokenR.response.data);
          }
        })
    );
  }

  // Call 3.5) Checkout the rule
  private checkout() {
    this.report('Checking out Business Rule) Min: ');
    const checkoutRequest = {
      request: {
        data: {
          project: [{
            name: 'CustomerOfferManagement',
            artifactItem: [{
              artifactPath: this.beRulePath,
              artifactType: 'ruletemplateinstance',
              fileExtension: 'ruletemplateinstance',
              baseArtifactPath: ''
            }]
          }]
        }
      }
    };

    console.log('CHECKOUT URL: ' + this.checkoutURL);
    return this.callService(this.checkoutURL, 'POST', checkoutRequest, 'application/json').pipe(
      map((dataCH) => {
        console.log('dataB: ', dataCH);
        if (dataCH.response.status === '0') {
          this.report(dataCH.response.responseMessage + '.');
          return dataCH;
        } else {
          this.report('ERROR STATUS: ' + dataCH.response.data);
          throw new Error('ERROR STATUS: ' + dataCH.response.data);
        }
      })
    );


  }

  /*
  Checkout:
  
  https://eu.events.cloud.tibco.com/ws/api/d163aef5e69445178c74e52e70640b81/projects/CustomerOfferManagement/checkout.json
  
  {"request":{"data":{"project":[{"name":"CustomerOfferManagement","artifactItem":[{"artifactPath":"/BusinessRules/CalculateShipping","artifactType":"ruletemplate","fileExtension":"ruletemplate","baseArtifactPath":""},{"artifactPath":"/BusinessRules/CalculateShippingView","artifactType":"ruletemplateview","fileExtension":"ruletemplateview","baseArtifactPath":""},{"artifactPath":"/Rules/Checkout","artifactType":"rule","fileExtension":"rule","baseArtifactPath":""},{"artifactPath":"/Events/CheckoutEvent","artifactType":"event","fileExtension":"event","baseArtifactPath":""},{"artifactPath":"/Concepts/Customer","artifactType":"concept","fileExtension":"concept","baseArtifactPath":""},{"artifactPath":"/Events/CustomerOperations","artifactType":"event","fileExtension":"event","baseArtifactPath":""},{"artifactPath":"/Events/CustomerRegistration","artifactType":"event","fileExtension":"event","baseArtifactPath":""},{"artifactPath":"/Domains/DeliveryModes","artifactType":"domain","fileExtension":"domain","baseArtifactPath":""},{"artifactPath":"/RuleFunctions/DiscountPercent","artifactType":"rulefunctionimpl","fileExtension":"rulefunctionimpl","baseArtifactPath":"/RuleFunctions/DiscountPercentVRF.rulefunction"},{"artifactPath":"/RuleFunctions/DiscountPercentVRF","artifactType":"rulefunction","fileExtension":"rulefunction","baseArtifactPath":""},{"artifactPath":"/Channels/HTTP","artifactType":"channel","fileExtension":"channel","baseArtifactPath":""},{"artifactPath":"/RuleFunctions/precheck","artifactType":"rulefunction","fileExtension":"rulefunction","baseArtifactPath":""},{"artifactPath":"/Concepts/PurchaseItem","artifactType":"concept","fileExtension":"concept","baseArtifactPath":""},{"artifactPath":"/Concepts/PurchaseOrder","artifactType":"concept","fileExtension":"concept","baseArtifactPath":""},{"artifactPath":"/Rules/RegisterCustomer","artifactType":"rule","fileExtension":"rule","baseArtifactPath":""},{"artifactPath":"/Events/Response/ResponseEvent","artifactType":"event","fileExtension":"event","baseArtifactPath":""},{"artifactPath":"/BusinessRules/SpecialOffer","artifactType":"ruletemplate","fileExtension":"ruletemplate","baseArtifactPath":""},{"artifactPath":"/Events/Transact","artifactType":"event","fileExtension":"event","baseArtifactPath":""},{"artifactPath":"/Rules/UpdateCartTransaction","artifactType":"rule","fileExtension":"rule","baseArtifactPath":""},{"artifactPath":"/Rules/ValidateCustomer","artifactType":"rule","fileExtension":"rule","baseArtifactPath":""}]}]}}}
  
  
  
  */

  // Call 4) Save business rule
  private save(bRule: BusinessRule) {
    this.report('Saving Business Rule) Min: ' + bRule.min + ' Max: ' + bRule.max + ' Mode: ' + bRule.shippingMode);
    const artifactInput = '{"view":{"bindingInfo":[{"bindingId":"minimumAmount","value": "' + bRule.min + '"},{"bindingId":"maximumAmount","value":"' + bRule.max + '"},{"bindingId":"shippingMode","value":"' + bRule.shippingMode + '"}]}}';
    const saveRequest = {
      request: {
        data: {
          project: [{
            name: this.beProjectName,
            artifactItem: [{
              artifactPath: this.beRulePath,
              artifactType: 'ruletemplateinstance',
              fileExtension: 'ruletemplateinstance',
              implementsPath: this.beImplementsPath,
              isSyncMerge: 'false',
              artifactContent: artifactInput,
              description: '',
              rulePriority: 5
            }]
          }]
        }
      }
    };
    console.log('SAVE URL: ' + this.saveURL);
    return this.callService(this.saveURL, 'POST', saveRequest, 'application/json').pipe(
      map((dataB) => {
        console.log('dataB: ', dataB);
        if (dataB.response.status === '0') {
          this.report(dataB.response.responseMessage + '.');
          return dataB;
        } else {
          this.report('ERROR STATUS: ' + dataB.response.data);
          throw new Error('ERROR STATUS: ' + dataB.response.data);
        }
      })
    );
  }

  // Call 5) Committing business rule
  private commit() {
    const now = new Date();
    const time = now.getTime();
    const commitMessage = 'OK ' + time;
    this.report('Committing: ' + commitMessage);
    const commitPayload = {
      request: {
        data: {
          commitComments: commitMessage,
          project: [{
            name: this.beProjectName,
            artifactItem: [{
              artifactPath: this.beRulePath,
              artifactType: 'ruletemplateinstance',
              fileExtension: 'ruletemplateinstance',
              baseArtifactPath: ''
            }]
          }]
        }
      }
    };
    console.log('Commit URL: ' + this.commitURL);
    return this.callService(this.commitURL, 'POST', commitPayload, 'application/json').pipe(
      map((dataC) => {
        if (dataC.response.status === '0') {
          this.globalRevisionID = dataC.response.responseMessage.substring(
            dataC.response.responseMessage.lastIndexOf('[') + 1,
            dataC.response.responseMessage.lastIndexOf(']')
          );
          this.report(dataC.response.responseMessage + '.');
          return dataC;
        } else {
          this.report('ERROR STATUS: ' + dataC.response.data);
          throw new Error('ERROR STATUS: ' + dataC.response.data);
        }
      })
    );
  }

  // Call 6) Generating deployment
  private generateDeploy() {
    this.report('Generating Deployment...');
    return this.callService(this.genDeployURL, 'GET', null, 'application/json').pipe(
      map((dataCom) => {
        if (dataCom.response.status === '0') {
          this.report(dataCom.response.responseMessage + '.');
          return dataCom;
        } else {
          this.report('ERROR STATUS: ' + dataCom.response.data);
          throw new Error('ERROR STATUS: ' + dataCom.response.data);
        }
      })
    );
  }

  // Call 7) Publish Business Rule
  private publish() {
    this.report('Publishing new business rule...');
    const publishRequest = {
      request: {
        data: {
          worklist: [{
            revisionId: this.globalRevisionID,
            worklistItem: [{
              artifactPath: this.beRulePath,
              artifactType: 'ruletemplateinstance',
              managedProjectName: this.beProjectName,
              reviewStatus: 'BuildAndDeploy',
              deployEnvironments: '',
              reviewComments: 'Deployed'
            }]
          }]
        }
      }
    };
    return this.callService(this.publishURL, 'POST', publishRequest, 'application/json').pipe(
      map((dataCom) => {
        if (dataCom.response.status === '0') {
          this.report('New Business Rule Deployed !');
          return dataCom;
        } else {
          this.report('ERROR STATUS: ' + dataCom.response.data);
          throw new Error('ERROR STATUS: ' + dataCom.response.data);
        }
      })
    );
  }

  // get tce projects
  private projects() {
    this.report('Getting WebStudio projects: ');
    
    console.log('PROJECT URL: ' + this.projectsURL);
    return this.callService(this.projectsURL, 'GET', null, 'application/json').pipe(
      map((projectsRes) => {
        console.log('projects response: ', projectsRes);
        if (projectsRes.response.status === '0') {
          this.report(projectsRes.response.responseMessage + '.');
          return projectsRes;
        } else {
          this.report('ERROR STATUS: ' + projectsRes.response.data);
          throw new Error('ERROR STATUS: ' + projectsRes.response.data);
        }
      })
    );
  }


  // Function to call service and return an observable
  private callService(url, method, postRequest, contentType): Observable<any> {
    const cMethod = method || 'GET';
    const cType = contentType || 'application/json';
    let body = null;
    if (cMethod === 'POST') {
      if (cType === 'application/json') {
        body = JSON.stringify(postRequest);
      } else {
        body = postRequest;
      }
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': cType
      })
    };
    console.log('--- CALLING SERVICE ---');
    console.log('-     URL: ' + url);
    console.log('-  METHOD: ' + cMethod);
    console.log('- CONTENT: ' + cType);
    console.log('-    BODY: ' + body);
    if (method === 'POST') {
      return this.http.post(encodeURI(url), body, httpOptions).pipe(
        map(this.extractData));
    } else {
      return this.http.get(encodeURI(url), httpOptions).pipe(
        map(this.extractData));
    }
  }

  // Function to extract the result from a service call
  private extractData(res: Response) {
    const body = res;
    return body || {};
  }

}
