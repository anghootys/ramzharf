import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SplitButton} from 'primeng/splitbutton';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');

  toggleTheme() {
    const document_element = document.querySelector('html')
    document_element?.classList.toggle('app-dark-mode')
  }
}
