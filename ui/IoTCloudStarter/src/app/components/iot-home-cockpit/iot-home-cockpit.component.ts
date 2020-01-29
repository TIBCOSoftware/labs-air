
import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { RouteAction } from '@tibco-tcstk/tc-core-lib';
import { LiveAppsHomeCockpitComponent, Roles, RouteAccessControlConfigurationElement } from '@tibco-tcstk/tc-liveapps-lib';
import { CustomFormDefs } from '@tibco-tcstk/tc-forms-lib';

interface ROUTE {
    icon?: string;
    route?: string;
    title?: string;
    custom?: boolean;
}

@Component({
    selector: 'app-iot-home-cockpit',
    templateUrl: './iot-home-cockpit.component.html',
    styleUrls: ['./iot-home-cockpit-style.css']
})

export class IotHomeCockpitComponent extends LiveAppsHomeCockpitComponent {

    networkRoutes: ROUTE[] = [
        {
            icon: 'iotdashboard',
            route: '/starterApp/home/iotdashboard',
            title: 'IoT Dashboard',
            custom: true
        }, {
            icon: 'gateway',
            route: '/starterApp/home/gateway',
            title: 'Gateways',
            custom: true
        }
    ];

    deviceRoutes: ROUTE[] = [
        {
            icon: 'device',
            route: '/starterApp/home/device',
            title: 'Devices',
            custom: true
        }, {
            icon: 'devicedashboard',
            route: '/starterApp/home/deviceprofile',
            title: 'Device Profiles',
            custom: true
        }, {
            icon: 'provisioning',
            route: '/starterApp/home/deviceprovision',
            title: 'Device Provisioning',
            custom: true
        }, {
            icon: 'command',
            route: '/starterApp/home/devicecommand',
            title: 'Device Commands',
            custom: true
        }, {
            icon: 'rules',
            route: '/starterApp/home/rules',
            title: 'Edge Rules',
            custom: true
        }, {
            icon: 'rules',
            route: '/starterApp/home/tcerules',
            title: 'Cloud Rules',
            custom: true
        }, {
            icon: 'instrumenthistory',
            route: '/starterApp/home/notifications',
            title: 'Notifications',
            custom: true
        },  {
            icon: 'settings',
            route: '/starterApp/home/casemanagement',
            title: 'Case Management',
            custom: false
        }, {
            icon: 'settings',
            route: 'sales/leads',
            title: 'Settings',
            custom: false
        }, {
            icon: 'get_app',
            route: 'sales/opportunities',
            title: 'Software Update',
            custom: false
        }
    ];


    /**
     * The Application ID of the UI (should ideally be unique as it is shared state key)
     */
    @Input() uiAppId: string;

    /**
     * The list of LA Application IDs you want to handle
     */
    @Input() appIds: string[];

    /**
     * sandboxId - this comes from claims resolver
     */
    @Input() sandboxId: number;

    /**
     * The name of the logged user
     */
    @Input() userName: string;

    /**
     * The ID of the logged user
     */
    @Input() userId: string;

    /**
     * * NOT USED but is the email address of the user (comes from resolver)
     */
    @Input() email: string;

    /**
     * page title comes from config resolver
     */
    @Input() title: string;

    /**
     * Roles - The users current roles
     */
    @Input() roles: Roles;

    /**
     * RouteAccessControlConfigurationElement - basically the config for access control
     */
    @Input() access: RouteAccessControlConfigurationElement;

    /**
     * Custom Form configuration file
     */
    @Input() customFormDefs: CustomFormDefs;

    /**
     * ~event routeAction : Component requests route to another page
     * ~payload RouteAction : RouteAction object to tell caller to navigate somewhere
     */
    @Output() routeAction: EventEmitter<RouteAction> = new EventEmitter<RouteAction>();



}
