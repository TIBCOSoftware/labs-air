import { Component, OnInit } from '@angular/core';
import { LiveAppsHomeCockpitComponent } from '@tibco-tcstk/tc-liveapps-lib';
import { ToolbarButton } from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'app-air-home-cockpit',
  templateUrl: './air-home-cockpit.component.html',
  styleUrls: ['./air-home-cockpit.component.css']
})
export class AirHomeCockpitComponent extends LiveAppsHomeCockpitComponent {

  

  initialize() {
    this.toolbarButtons = this.toolbarButtons.concat(this.createToolbarButtons());
    this.burgerMenuButtons = this.createBurgerMenuButtons();
    this.caseStartButtonActive = this.access ? this.rolesService.checkButton('caseStart', this.access) : true;
    this.cockpitReady = true;
  }

  protected createBurgerMenuButtons = (): ToolbarButton[] => {
    const button1 = this.buttonsHelper.createButton('button1', 'tcs-capabilities', true, 'Config', true, true, 'Button 1');
    const button2 = this.buttonsHelper.createButton('button2', 'tcs-refresh-icon', true, 'Refresh', true, true, 'Button 2');
    const buttons = [button1, button2];
    return buttons;
  }

  public handleBurgerMenuClick = (id) => {
    console.log('Burger menu clicked: ', id);
  }

}
