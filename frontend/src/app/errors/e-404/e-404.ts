import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-e-404',
  imports: [Button],
  templateUrl: './e-404.html',
  styleUrl: './e-404.scss',
})
export class E404 {
  private router = inject(Router);

  goHome(): void {
    this.router.navigate(['/']);
  }
}
