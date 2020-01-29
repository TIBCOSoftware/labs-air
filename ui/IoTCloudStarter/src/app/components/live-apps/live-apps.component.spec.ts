import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveAppsComponent } from './live-apps.component';

describe('LiveAppsComponent', () => {
  let component: LiveAppsComponent;
  let fixture: ComponentFixture<LiveAppsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveAppsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
