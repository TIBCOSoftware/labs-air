import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotfireDashboardComponent } from './spotfire-dashboard.component';

describe('SpotfireDashboardComponent', () => {
  let component: SpotfireDashboardComponent;
  let fixture: ComponentFixture<SpotfireDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpotfireDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotfireDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
