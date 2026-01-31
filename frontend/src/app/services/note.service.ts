import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncryptionService } from './encryption.service';

export interface Note {
  id: string;
  user_id: string;
  encrypted_content: string;
  salt: string;
  expires_at: string | null;
  created_at: string;
}

export interface CreateNoteRequest {
  encryptedContent: string;
  salt: string;
  expiresIn: string | 'never';
}

export interface DecryptedNote extends Omit<Note, 'encrypted_content' | 'salt'> {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  http = inject(HttpClient);
  private encryptionService = inject(EncryptionService);
  private baseUrl = '/api/note';

  async createNote(content: string, password: string, expiresInMs?: number): Promise<Observable<Note>> {
    // Encrypt with password
    const { encrypted, salt } = await this.encryptionService.encryptWithPassword(content, password);

    const request: CreateNoteRequest = {
      encryptedContent: encrypted,
      salt: salt,
      expiresIn: expiresInMs ? expiresInMs.toString() : 'never'
    };

    return this.http.post<Note>(`${this.baseUrl}/create`, request);
  }

  async getNote(id: string, password: string): Promise<Observable<DecryptedNote>> {
    return new Observable(observer => {
      this.http.get<Note>(`${this.baseUrl}/${id}`).subscribe({
        next: async (note) => {
          try {
            // Decrypt with password
            const content = await this.encryptionService.decryptWithPassword(
              note.encrypted_content,
              password,
              note.salt
            );

            const decryptedNote: DecryptedNote = {
              id: note.id,
              user_id: note.user_id,
              content,
              expires_at: note.expires_at,
              created_at: note.created_at
            };
            observer.next(decryptedNote);
            observer.complete();
          } catch (error) {
            observer.error({ message: 'Invalid password or corrupted note' });
          }
        },
        error: (error) => observer.error(error)
      });
    });
  }

  deleteNote(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  getMyNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.baseUrl}/my-notes`);
  }
}

