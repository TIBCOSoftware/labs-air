import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { Router } from '@angular/router';


@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  @Output() toggleSidenav = new EventEmitter<void>();

  /**
     * page title comes from config resolver
     */
  @Input() title: string;

  constructor(private router: Router) {

  }

  ngOnInit() {
  }

  public logout() {

  }
}
