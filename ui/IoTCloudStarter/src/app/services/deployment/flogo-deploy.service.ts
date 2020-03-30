import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';

@Injectable({
  providedIn: 'root'
})
export class FlogoDeployService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private logger: LogService,
    private http: HttpClient) {

    logger.level = LogLevel.Debug;

  }

  deploy(request): Observable<string> {

    const url = `/deployment/deploy`;

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => this.logger.info('Deployed New Pipeline')),
        catchError(this.handleError<string>('deploy'))
      );
  }

  undeploy(request): Observable<string> {

    const url = `/deployment/undeploy`;

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => this.logger.info('Undeployed Pipeline')),
        catchError(this.handleError<string>('undeploy'))
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

