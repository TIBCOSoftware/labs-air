import { Component, OnInit } from '@angular/core';
import {TcButtonsHelperService, ToolbarButton} from '@tibco-tcstk/tc-core-lib';
import {RouteAction} from '@tibco-tcstk/tc-core-lib';
import {Router, ActivatedRoute} from '@angular/router';
import {ConfigurationMenuConfig} from '@tibco-tcstk/tc-core-lib';
import { TcRolesService } from '@tibco-tcstk/tc-liveapps-lib';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  viewButtons: ToolbarButton[];
  configMenuPages: ConfigurationMenuConfig[];

  constructor(private buttonsHelper: TcButtonsHelperService, private router: Router, private route: ActivatedRoute, private rolesService: TcRolesService) { }

  handleRouteAction = (routeAction: RouteAction) => {
    if (routeAction.action === 'backClicked') {
      // back clicked - navigate to home
        console.log("*****", this.rolesService.getCurrentRole());
      this.router.navigate(['/starterApp/home/']);
    }
  }

  public handleToolbarButtonEvent = (id) => {
    console.log('Selected option: ' + id);
  }

  ngOnInit() {
    const configurationMenu = this.route.snapshot.data.configurationMenuHolder;
    this.configMenuPages = configurationMenu.menu;
  }

}
