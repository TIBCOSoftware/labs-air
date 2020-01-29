import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { DataStoreMetadata } from '../../shared/models/iot.model';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  private datastorePath = '/datastore';

  constructor(private http: HttpClient,
    private logger: LogService) {

  }


  updateDataStoreForGateway(dsmetadata: DataStoreMetadata): Observable<String> {
    const url = `${this.datastorePath}/metadata`;

    return this.http.post<string>(url, dsmetadata)
      .pipe(
        tap(_ => this.logger.info('updated datastore metatada')),
        catchError(this.handleError<string>('updateDataStoreForGateway'))
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
