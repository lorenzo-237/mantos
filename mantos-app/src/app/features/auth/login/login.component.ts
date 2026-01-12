import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest } from '../../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <p-toast />

      <p-card class="w-full max-w-md shadow-lg">
        <ng-template pTemplate="header">
          <div class="text-center py-4">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">Mantos</h1>
            <p class="text-gray-600 dark:text-gray-400">Mantis Issue Tracker Integration</p>
          </div>
        </ng-template>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Username Field -->
          <div class="flex flex-col gap-2">
            <label for="username" class="font-semibold text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              pInputText
              id="username"
              formControlName="username"
              placeholder="Enter your username"
              class="w-full"
              [class.ng-invalid]="
                loginForm.get('username')?.invalid && loginForm.get('username')?.touched
              "
            />
            @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
              <small class="text-red-500">Username is required</small>
            }
          </div>

          <!-- Password Field -->
          <div class="flex flex-col gap-2">
            <label for="password" class="font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <p-password
              id="password"
              formControlName="password"
              placeholder="Enter your password"
              [toggleMask]="true"
              [feedback]="false"
              styleClass="w-full"
              inputStyleClass="w-full"
              [class.ng-invalid]="
                loginForm.get('password')?.invalid && loginForm.get('password')?.touched
              "
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <small class="text-red-500">Password is required</small>
            }
          </div>

          <!-- LDAP Checkbox -->
          <div class="flex items-center gap-2">
            <p-checkbox formControlName="ldap" [binary]="true" inputId="ldap" />
            <label for="ldap" class="text-gray-700 dark:text-gray-300 cursor-pointer">
              Use LDAP Authentication
            </label>
          </div>

          <!-- Submit Button -->
          <p-button
            type="submit"
            label="Sign In"
            [loading]="isLoading()"
            [disabled]="loginForm.invalid || isLoading()"
            styleClass="w-full"
            severity="primary"
          />
        </form>

        <ng-template pTemplate="footer">
          <div class="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
            <p>Please contact your administrator if you need assistance</p>
          </div>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep {
        .p-card {
          border-radius: 12px;
          overflow: hidden;
        }

        .p-card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .p-card-body {
          padding: 2rem;
        }

        .p-button {
          height: 3rem;
          font-weight: 600;
        }

        .p-password input {
          width: 100%;
        }

        .p-inputtext:focus,
        .p-password input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  isLoading = signal(false);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    ldap: [false],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: `Welcome back, ${response.user.username}!`,
          life: 3000,
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Login error:', error);

        const errorMessage =
          error.error?.message || error.message || 'Invalid username or password';

        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: errorMessage,
          life: 5000,
        });
      },
    });
  }
}
