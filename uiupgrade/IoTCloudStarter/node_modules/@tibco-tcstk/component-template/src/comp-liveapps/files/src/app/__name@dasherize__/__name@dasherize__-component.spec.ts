import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { <%= name %>Component } from './<%= name %>.component';

describe('<%= name %>Component', () => {
    let component: <%= name %>Component;
    let fixture: ComponentFixture<<%= name %>Component>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ <%= name %>Component ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(<%= name %>Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
