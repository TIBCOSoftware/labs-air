import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import {RouteAction} from '@tibco-tcstk/tc-core-lib';
import {LiveAppsCaseCockpitComponent,Roles,RouteAccessControlConfig} from '@tibco-tcstk/tc-liveapps-lib';
import {CustomFormDefs} from '@tibco-tcstk/tc-forms-lib';

@Component({
    selector: 'app-<%= dasherize(name) %>',
    templateUrl: './<%= dasherize(name) %>.component.html',
    styleUrls: ['./<%= dasherize(name) %>-style.css']
})

export class <%= classify(name) %>Component extends LiveAppsCaseCockpitComponent {

    /**
     * The Application ID of the UI (should ideally be unique as it is shared state key)
     */
@Input() uiAppId: string;

    /**
     * The LA Application Id
     */
@Input() appId: string;

    /**
     * The LA Application Type Id (generally 1)
     */
@Input() typeId: string;

    /**
     * sandboxId - this comes from claims resolver
     */
@Input() sandboxId: number;

    /**
     * The case reference
     */
@Input() caseRef: string;

    /**
     * The ID of the logged user
     */
@Input() userId: string;

    /**
     * The list of LA Application Ids you want to mark as recent cases when accessed
     */
@Input() exclRecentAppIds: string[];

    /**
     * Roles - The users current roles
     */
@Input() roles: Roles;

    /**
     * RouteAccessControlConfig - basically the config for access control
     */
@Input() access: RouteAccessControlConfig;

    /**
     * Custom Form configuration file
     */
@Input() customFormDefs: CustomFormDefs;

    /**
     * Layout object that can be passed to override default layout of the form renderer
     */
@Input() layout: any[] = this.layout ?  this.layout : this.DEFAULT_CASE_DATA_LAYOUT;


    /**
     * ~event routeAction : Component requests route to another page
     * ~payload RouteAction : RouteAction object to tell caller to navigate somewhere
     */
@Output() routeAction: EventEmitter<RouteAction> = new EventEmitter<RouteAction>();




}
