import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TceRulesComponent } from './tce-rules.component';

describe('TceRulesComponent', () => {
  let component: TceRulesComponent;
  let fixture: ComponentFixture<TceRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TceRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TceRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
