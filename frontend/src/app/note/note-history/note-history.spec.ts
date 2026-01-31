import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteHistory } from './note-history';

describe('NoteHistory', () => {
  let component: NoteHistory;
  let fixture: ComponentFixture<NoteHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoteHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
