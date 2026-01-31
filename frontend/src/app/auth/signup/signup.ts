import { Component, inject, OnInit } from '@angular/core';
import { FormContainer } from '../../ui/form-container/form-container';
import { FormInputContainer } from '../../ui/form-input-container/form-input-container';
import { FormInput } from '../../ui/form-input/form-input';
import { FloatLabel } from 'primeng/floatlabel';
import { Password } from 'primeng/password';
import { ButtonDirective } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormContainer,
    FormInputContainer,
    FormInput,
    FloatLabel,
    Password,
    ButtonDirective,
    RouterLink,
    InputText
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor() {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Redirect if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/note/history']);
    }
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }

    const { password, confirmPassword } = this.signupForm.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.signupForm.value).subscribe({
      next: () => {
        this.router.navigate(['/note/history']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
