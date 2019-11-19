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

  public title: string;
  public subTitle: string;
  public highlights: LandingPageItemConfig[];
  public navigateURL: string;

  private splashHighlights = [
    {
      "title": "Engage",
      "iconURL": "ic-documentation",
      "content": "Handle all IoT related requests in a single place - e.g. manage gateways, manage devices, view device data."
    },
    {
      "title": "Collaborate",
      "iconURL": "ic-community",
      "content": "Collaborate on open and interoperable IoT solutions built on open standards"
    },
    {
      "title": "Track",
      "iconURL": "ic-graph",
      "content": "Track and respond to high priority devices using alerts and actions"
    }
  ];


  constructor(private router: Router, private route: ActivatedRoute, private location: Location) {
  }

  public handleGetStarted = (event) => {
    // get started - navigate to home
    this.router.navigate([this.navigateURL]);
  }

  ngOnInit() {

    console.log("Landing Page Config: ", this.route.snapshot.data.landingPagesConfigHolder);

    const splash_config = this.route.snapshot.data.landingPagesConfigHolder.landingPage[0];

    console.log("Splash config: ", splash_config);

    this.title = "Welcome to Project AIR";
    this.subTitle = "A customizable CloudStarter application to manage IoT assets";

      // this.title = splash_config.title;
      // this.subTitle = splash_config.subtitle;
      // this.backgroundImage = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, splash_config.backgroundURL);



    this.highlights = new Array();
    
    // splash_config.highlights.forEach(highlight => {
    //   this.highlights.push(new LandingPageItemConfig().deserialize({
    //     title: highlight.title,
    //     content: highlight.content,
    //     iconURL: highlight.iconURL
    //   }));

    // });

    this.splashHighlights.forEach(highlight => {
      this.highlights.push(new LandingPageItemConfig().deserialize({
        title: highlight.title,
        content: highlight.content,
        iconURL: highlight.iconURL
      }));

    });

    this.navigateURL = splash_config.homeRoute;
  }

}
