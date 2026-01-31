import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteService, DecryptedNote } from '../../services/note.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';
import { FloatLabel } from 'primeng/floatlabel';
import { DateViewer, IDate } from '../../ui/date-viewer/date-viewer';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-view-note',
  imports: [CommonModule, FormsModule, Button, Password, FloatLabel, DateViewer, ToastModule],
  providers: [MessageService],
  templateUrl: './view-note.html',
  styleUrl: './view-note.scss',
})
export class ViewNote implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private noteService = inject(NoteService);
  private domSanitizer = inject(DomSanitizer);
  private messageService = inject(MessageService);

  note = signal<DecryptedNote | null>(null);
  encryptedNote = signal<any | null>(null);
  loading = signal(true);
  error = signal('');
  password = signal('');
  showPasswordPrompt = signal(false);
  decrypting = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadEncryptedNote(id);
    }
  }

  async loadEncryptedNote(id: string): Promise<void> {
    try {
      this.noteService.http.get<any>(`/api/note/${id}`).subscribe({
        next: (encryptedNote) => {
          this.encryptedNote.set(encryptedNote);
          this.loading.set(false);
          this.showPasswordPrompt.set(true);
        },
        error: (error) => {
          this.error.set(error.error?.error || 'Failed to load note');
          this.loading.set(false);
        }
      });
    } catch (error) {
      this.error.set('Failed to load note');
      this.loading.set(false);
    }
  }

  async decryptNote(): Promise<void> {
    if (!this.password()) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: 'لطفا رمز عبور را وارد کنید'
      });
      return;
    }

    this.decrypting.set(true);
    const encNote = this.encryptedNote();

    try {
      const observable = await this.noteService.getNote(encNote.id, this.password());
      observable.subscribe({
        next: (note) => {
          this.note.set(note);
          this.showPasswordPrompt.set(false);
          this.decrypting.set(false);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطا',
            detail: 'رمز عبور اشتباه است'
          });
          this.decrypting.set(false);
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: 'خطا در رمزگشایی نویسه'
      });
      this.decrypting.set(false);
    }
  }

  getSafeContent(): SafeHtml {
    const content = this.note()?.content || '';
    return this.domSanitizer.bypassSecurityTrustHtml(content);
  }

  formatDate(dateString: string): IDate {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fa-IR'),
      time: date.toLocaleTimeString('fa-IR')
    };
  }

  getExpirationDate(): IDate | undefined {
    const expiresAt = this.note()?.expires_at;
    return expiresAt ? this.formatDate(expiresAt) : undefined;
  }

  getCreatedDate(): IDate | undefined {
    const createdAt = this.note()?.created_at;
    return createdAt ? this.formatDate(createdAt) : undefined;
  }
}
