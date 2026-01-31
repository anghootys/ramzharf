import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateViewer } from './date-viewer';

describe('DateViewer', () => {
  let component: DateViewer;
  let fixture: ComponentFixture<DateViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
