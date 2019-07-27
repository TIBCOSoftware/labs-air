import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {LandingPageItemConfig, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
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

  constructor(private router: Router, private route: ActivatedRoute, private location: Location) {
  }

  public handleGetStarted = (event) => {
    // get started - navigate to home
    this.router.navigate([this.navigateURL]);
  }

  ngOnInit() {
    const splash_config = this.route.snapshot.data.landingPagesConfigHolder.landingPage[0];

    this.title = splash_config.title;
    this.subTitle = splash_config.subtitle;
    //   this.backgroundImage = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, splash_config.backgroundURL);

    this.highlights = new Array();
    splash_config.highlights.forEach(highlight => {
        this.highlights.push(new LandingPageItemConfig().deserialize({
            title: highlight.title,
            content: highlight.content,
            iconURL: highlight.iconURL
        }));

    });
    this.navigateURL = splash_config.homeRoute;
  }

}
