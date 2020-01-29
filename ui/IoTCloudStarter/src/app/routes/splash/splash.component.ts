import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LandingPageItemConfig, TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { Location } from '@angular/common';
@Component({
    selector: 'app-splash',
    templateUrl: './splash.component.html',
    styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
    public uiAppId: string
    public roleId: string;
    constructor(private router: Router, private route: ActivatedRoute, private location: Location) {
    }
    public handleGetStarted = (event: any): void => {
        // get started - navigate to home
        
        // this.router.navigate([event.context]);
        this.router.navigate(['/starterApp/home/gateway']);
    }
    ngOnInit() {
        this.uiAppId = this.route.snapshot.data.generalConfigHolder.uiAppId;
        this.roleId = this.route.snapshot.data.activeRoleHolder.id;
    }
}
