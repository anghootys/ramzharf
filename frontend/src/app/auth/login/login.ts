import { Component, inject, OnInit } from '@angular/core';
import { FormContainer } from '../../ui/form-container/form-container';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Button, ButtonDirective } from 'primeng/button';
import { FormInputContainer } from '../../ui/form-input-container/form-input-container';
import { FormInput } from '../../ui/form-input/form-input';
import { Password } from 'primeng/password';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormContainer,
    InputText,
    FloatLabel,
    FormInputContainer,
    FormInput,
    Password,
    ButtonDirective,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Redirect if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/note/history']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/note/history']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Login failed';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
