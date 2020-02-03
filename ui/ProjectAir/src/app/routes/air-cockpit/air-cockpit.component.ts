import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { TcButtonsHelperService, ToolbarButton, RoleAttribute, MessageQueueService } from '@tibco-tcstk/tc-core-lib';
import { TcRolesService, CaseType, LiveAppsCreatorDialogComponent, CaseCreatorSelectionContext, FormConfig } from '@tibco-tcstk/tc-liveapps-lib';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomFormDefs } from '@tibco-tcstk/tc-forms-lib';

@Component({
  selector: 'air-cockpit',
  templateUrl: './air-cockpit.component.html',
  styleUrls: ['./air-cockpit.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AirCockpitComponent implements OnInit, OnDestroy {

  public title: string;
  public toolbarButtons: ToolbarButton[];
  public burgerMenuButtons: ToolbarButton[];

  public currentView: string;
  sandboxId: any;
  appIds: any;

  private subscription: Subscription;

  public customFormDefs: CustomFormDefs;
  public formConfig: FormConfig

  constructor(
    private buttonsHelper: TcButtonsHelperService,
    private roleService: TcRolesService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private messageService: MessageQueueService
  ) {
    this.subscription = this.messageService.getMessage('title-bar').subscribe(message => {
      setTimeout(() => {
        this.currentView = message.text;
        this.generateTitle(message);
      });
    });
  }

  ngOnInit() {
    this.generateTitle('Pending to customize title');

    this.sandboxId = this.route.snapshot.data.claims.primaryProductionSandbox.id;
    this.appIds = this.route.snapshot.data.laConfigHolder.liveAppsConfig.applicationIds;

    this.customFormDefs = this.route.snapshot.data.customFormDefs;
    this.formConfig = this.route.snapshot.data.formConfig;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  protected createToolbarButtons = (): ToolbarButton[] => {
    const configButton = this.buttonsHelper.createButton('config', 'tcs-capabilities', true, 'Config', true, true);
    const refreshButton = this.buttonsHelper.createButton('refresh', 'tcs-refresh-icon', true, 'Refresh', true, true);
    const buttons = [refreshButton, configButton];

    return buttons;
  }

  protected createBurgerMenuButtons = (): ToolbarButton[] => {
    const buttons = [
      this.buttonsHelper.createButton('button1', '', true, 'Button 1', true, true, 'Button 1'),
      this.buttonsHelper.createButton('button2', '', true, 'Button 2', true, true, 'Button 2'),
      this.buttonsHelper.createButton('button3', '', true, 'Button 3', true, true, 'Button 3'),
    ];

    return buttons;
  }

  public handleToolbarButtonEvent = (buttonId: string) => {
    if (buttonId === 'config') {
      this.router.navigate(['/starterApp/configuration/']);
    }

    if (buttonId === 'refresh') {
      this.refresh();
    }
  }

  public handleBurgerMenuButtonEvent = (event: string) => {
    console.log("Cicked burger button " + event)
  }

  private generateTitle = (message): void => {
    if (message instanceof Object) {
      this.title = message.text;
    } else {
      this.title = message;
    }

    this.toolbarButtons = this.createToolbarButtons();
    this.burgerMenuButtons = this.createBurgerMenuButtons();
  }

  public handleCreatorAppSelection = (application: CaseType): void => {
    let selectedVariant: string = '';
    let selectedVariantID: string = '';

    const EXAMPLE_INITIAL_DATA = {
      DiscoverCompliance: {
        ShortDescription: selectedVariant,
        Context: {
          ContextType: 'Case', // For now, can be changed in the future to Variant or None
          ContextID: selectedVariantID
        },
        DataSourceName: this.title.slice(11, this.title.length),
        DataSourceId: this.title.slice(0, 10)
      },
      DiscoverImprovement: {
        ShortDescription: selectedVariant,
        Context: {
          ContextType: 'Case', // For now, can be changed in the future to Variant or None
          ContextID: selectedVariantID
        },
        DataSourceName: this.title.slice(11, this.title.length),
        DataSourceId: this.title.slice(0, 10)
      }
    };
    this.openCreatorDialog(application, EXAMPLE_INITIAL_DATA, this.sandboxId, this.customFormDefs);
  }

  private openCreatorDialog = (application: CaseType, initialData, sandboxId, customFormDefs) => {
    const dialogRef = this.dialog.open(LiveAppsCreatorDialogComponent, {
      width: '60%',
      height: '80%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'tcs-style-dialog',
      data: new CaseCreatorSelectionContext(application, initialData, sandboxId, customFormDefs, false, "material-design", this.formConfig)
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/starterApp/pd/case/' + result.appId + '/' + result.typeId + '/' + result.caseRef], {});
      }
    });
  }

  @ViewChild(RouterOutlet, { static: false }) routerOutlet: RouterOutlet;

  public refresh = () => {
    // @ts-ignore
    if (this.routerOutlet.component.refresh) {
      // @ts-ignore
      this.routerOutlet.component.refresh();
    }
  }
}

