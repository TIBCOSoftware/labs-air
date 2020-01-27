import {Component} from '@angular/core';
import {LogLevel, LogService} from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Air';

  constructor(private logger: LogService) {
    logger.level = LogLevel.Debug;
    logger.info('My Cloud Starter Online...');
  }
}
