import { Component, OnInit } from '@angular/core';

/**
 * <%= name %>
 * detailed Component Description
 *
 */
@Component({
    selector: 'app-<%= name %>',
    templateUrl: './<%= name %>.component.html',
    styleUrls: ['./<%= name %>-style.css']
})


/**
 * Class Description of the Component
 */
export class <%= name %>Component implements OnInit {
//@Input() sandboxId: number;


    somedata: any;

    constructor (){
       // super();
    }


    /**
     * global Component Refresh Function
     */
    public refresh = () => {
        //some code
    }

    ngOnInit() {
        // on init get required data
        this.refresh();
    }

}
