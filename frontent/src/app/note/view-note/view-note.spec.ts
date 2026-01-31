import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNote } from './view-note';

describe('ViewNote', () => {
  let component: ViewNote;
  let fixture: ComponentFixture<ViewNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewNote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewNote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
