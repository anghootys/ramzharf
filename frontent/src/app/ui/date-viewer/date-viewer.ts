import {Component, input, InputSignal} from '@angular/core';

export interface IDate {
  date: string;
  time: string;
}

@Component({
  selector: 'date-viewer',
  templateUrl: './date-viewer.html',
  styleUrl: './date-viewer.scss',
})
export class DateViewer {
  date: InputSignal<IDate | undefined> = input();
}
