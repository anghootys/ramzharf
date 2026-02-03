import {Component, input} from '@angular/core';

@Component({
  selector: 'logo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
})
export class Logo {
  width= input(32);
  height = input(32);

  color = input('stroke-primary-500')
}
