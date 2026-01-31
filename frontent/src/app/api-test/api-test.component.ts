import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { NoteService } from '../services/note.service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule, Button],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">API Integration Tests</h1>

      <div class="space-y-4">
        <!-- Auth Tests -->
        <div class="border p-4 rounded">
          <h2 class="text-xl font-semibold mb-3">Authentication Tests</h2>

          <div class="space-y-2">
            <p-button label="Register Test User" (onClick)="testRegister()" [disabled]="loading()"/>
            <p-button label="Login Test User" (onClick)="testLogin()" [disabled]="loading()"/>
            <p-button label="Verify Token" (onClick)="testVerify()" [disabled]="loading()"/>
            <p-button label="Logout" (onClick)="testLogout()" [disabled]="loading()"/>
          </div>

          @if (authResult()) {
            <pre class="mt-3 p-2 bg-gray-100 rounded text-xs overflow-auto">{{ authResult() }}</pre>
          }
        </div>

        <!-- User Tests -->
        <div class="border p-4 rounded">
          <h2 class="text-xl font-semibold mb-3">User Service Tests</h2>

          <p-button label="Get Profile" (onClick)="testGetProfile()" [disabled]="loading()"/>

          @if (userResult()) {
            <pre class="mt-3 p-2 bg-gray-100 rounded text-xs overflow-auto">{{ userResult() }}</pre>
          }
        </div>

        <!-- Note Tests -->
        <div class="border p-4 rounded">
          <h2 class="text-xl font-semibold mb-3">Note Service Tests (with Encryption)</h2>

          <div class="space-y-2">
            <p-button label="Create Encrypted Note" (onClick)="testCreateNote()" [disabled]="loading()"/>
            <p-button label="Get Note (Decrypt)" (onClick)="testGetNote()" [disabled]="loading() || !lastNoteId()"/>
            <p-button label="Delete Note" (onClick)="testDeleteNote()" [disabled]="loading() || !lastNoteId()"/>
          </div>

          @if (noteResult()) {
            <pre class="mt-3 p-2 bg-gray-100 rounded text-xs overflow-auto">{{ noteResult() }}</pre>
          }
        </div>

        <!-- Encryption Tests -->
        <div class="border p-4 rounded">
          <h2 class="text-xl font-semibold mb-3">Encryption Tests (AES-GCM-256)</h2>

          <p-button label="Test Encryption/Decryption" (onClick)="testEncryption()" [disabled]="loading()"/>

          @if (encryptionResult()) {
            <pre class="mt-3 p-2 bg-gray-100 rounded text-xs overflow-auto">{{ encryptionResult() }}</pre>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ApiTestComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private noteService = inject(NoteService);

  loading = signal(false);
  authResult = signal('');
  userResult = signal('');
  noteResult = signal('');
  encryptionResult = signal('');
  lastNoteId = signal('');

  testRegister(): void {
    this.loading.set(true);
    const username = 'testuser_' + Date.now();

    this.authService.register({
      username,
      password: 'test123456',
      confirmPassword: 'test123456'
    }).subscribe({
      next: (result) => {
        this.authResult.set(JSON.stringify(result, null, 2));
        this.loading.set(false);
      },
      error: (error) => {
        this.authResult.set('Error: ' + JSON.stringify(error.error, null, 2));
        this.loading.set(false);
      }
    });
  }

  testLogin(): void {
    this.loading.set(true);

    this.authService.login({
      username: 'testuser',
      password: 'test123456'
    }).subscribe({
      next: (result) => {
        this.authResult.set(JSON.stringify(result, null, 2));
        this.loading.set(false);
      },
      error: (error) => {
        this.authResult.set('Error: ' + JSON.stringify(error.error, null, 2));
        this.loading.set(false);
      }
    });
  }

  testVerify(): void {
    this.loading.set(true);

    this.authService.verify().subscribe({
      next: (result) => {
        this.authResult.set('Token is valid: ' + JSON.stringify(result, null, 2));
        this.loading.set(false);
      },
      error: (error) => {
        this.authResult.set('Token invalid: ' + JSON.stringify(error.error, null, 2));
        this.loading.set(false);
      }
    });
  }

  testLogout(): void {
    this.loading.set(true);

    this.authService.logout().subscribe({
      next: () => {
        this.authResult.set('Logged out successfully');
        this.loading.set(false);
      },
      error: (error) => {
        this.authResult.set('Error: ' + JSON.stringify(error.error, null, 2));
        this.loading.set(false);
      }
    });
  }

  testGetProfile(): void {
    this.loading.set(true);

    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.userResult.set(JSON.stringify(profile, null, 2));
        this.loading.set(false);
      },
      error: (error) => {
        this.userResult.set('Error: ' + JSON.stringify(error.error, null, 2));
        this.loading.set(false);
      }
    });
  }

  async testCreateNote(): Promise<void> {
    this.loading.set(true);

    try {
      const content = 'Test note created at ' + new Date().toISOString();
      const password = 'test123456'; // Test password
      const observable = await this.noteService.createNote(content, password, 3600000); // 1 hour

      observable.subscribe({
        next: (note) => {
          this.lastNoteId.set(note.id);
          this.noteResult.set('Created note (encrypted):\n' + JSON.stringify(note, null, 2));
          this.loading.set(false);
        },
        error: (error) => {
          this.noteResult.set('Error: ' + JSON.stringify(error.error, null, 2));
          this.loading.set(false);
        }
      });
    } catch (error) {
      this.noteResult.set('Encryption error: ' + error);
      this.loading.set(false);
    }
  }

  async testGetNote(): Promise<void> {
    this.loading.set(true);

    try {
      const password = 'test123456'; // Same password used in creation
      const observable = await this.noteService.getNote(this.lastNoteId(), password);

      observable.subscribe({
        next: (note) => {
          this.noteResult.set('Decrypted note:\n' + JSON.stringify(note, null, 2));
          this.loading.set(false);
        },
        error: (error) => {
          this.noteResult.set('Error: ' + JSON.stringify(error.error, null, 2));
          this.loading.set(false);
        }
      });
    } catch (error) {
      this.noteResult.set('Decryption error: ' + error);
      this.loading.set(false);
    }
  }

  testDeleteNote(): void {
    this.loading.set(true);

    this.noteService.deleteNote(this.lastNoteId()).subscribe({
      next: (result) => {
        this.noteResult.set('Deleted: ' + JSON.stringify(result, null, 2));
        this.lastNoteId.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.noteResult.set('Error: ' + JSON.stringify(error.error, null, 2));
        this.loading.set(false);
      }
    });
  }

  async testEncryption(): Promise<void> {
    this.loading.set(true);

    try {
      // Import EncryptionService
      const { EncryptionService } = await import('../services/encryption.service');
      const encryptionService = new EncryptionService();

      // Generate key
      const key = await encryptionService.generateKey();

      // Test data
      const originalText = 'Hello, this is a test message with special chars: مرحبا 你好 🎉';

      // Encrypt
      const encrypted = await encryptionService.encrypt(originalText, key);

      // Decrypt
      const decrypted = await encryptionService.decrypt(encrypted, key);

      // Export/Import key test
      const exportedKey = await encryptionService.exportKey(key);
      const importedKey = await encryptionService.importKey(exportedKey);
      const decrypted2 = await encryptionService.decrypt(encrypted, importedKey);

      this.encryptionResult.set(
        `Original: ${originalText}\n\n` +
        `Encrypted (base64): ${encrypted.substring(0, 50)}...\n\n` +
        `Decrypted: ${decrypted}\n\n` +
        `Match: ${originalText === decrypted}\n\n` +
        `Exported Key (base64): ${exportedKey.substring(0, 50)}...\n\n` +
        `Re-decrypted: ${decrypted2}\n\n` +
        `Re-match: ${originalText === decrypted2}`
      );

      this.loading.set(false);
    } catch (error) {
      this.encryptionResult.set('Error: ' + error);
      this.loading.set(false);
    }
  }
}

