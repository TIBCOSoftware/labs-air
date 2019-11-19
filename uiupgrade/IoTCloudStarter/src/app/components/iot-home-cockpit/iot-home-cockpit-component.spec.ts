import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotHomeCockpitComponent } from './iot-home-cockpit.component';

describe('iot-home-cockpitComponent', () => {
    let component: IotHomeCockpitComponent;
    let fixture: ComponentFixture<IotHomeCockpitComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ IotHomeCockpitComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IotHomeCockpitComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
