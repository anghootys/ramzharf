import {Component, computed, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {Page} from '../../ui/page/page';
import {SelectButton} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {Badge} from 'primeng/badge';
import {TableModule} from 'primeng/table';
import {DateViewer, IDate} from '../../ui/date-viewer/date-viewer';
import {NoteService} from '../../services/note.service';
import {CommonModule} from '@angular/common';
import {Button} from 'primeng/button';

interface INoteCategory {
  id: number;
  title: string;
  count: () => number;
}

enum NoteCategory {
  ALL_NOTES = 1,
  ACTIVE_NOTES,
  EXPIRED_NOTES
}

interface INote {
  id: string;
  link: string;
  createdDate: IDate;
  expirationDate: IDate | null;
  isExpired: boolean;
}

@Component({
  selector: 'app-note-history',
  imports: [
    CommonModule,
    Page,
    SelectButton,
    FormsModule,
    Badge,
    TableModule,
    DateViewer,
    Button
  ],
  templateUrl: './note-history.html',
  styleUrl: './note-history.scss',
})
export class NoteHistory implements OnInit {
  private noteService = inject(NoteService);

  protected loading = signal(true);
  protected error = signal('');
  protected deletingNoteId = signal<string | null>(null);

  protected noteCategoryOptions: INoteCategory[] = [
    {
      id: NoteCategory.ALL_NOTES,
      title: "همه نویسه‌ها",
      count: () => this.notes().length,
    },
    {
      id: NoteCategory.ACTIVE_NOTES,
      title: "نویسه‌های منقضی نشده",
      count:() => this.notes().filter(x => !x.isExpired).length,
    },
    {
      id: NoteCategory.EXPIRED_NOTES,
      title: "نویسه‌های منقضی شده",
      count: () => this.notes().filter(x => x.isExpired).length,
    }
  ];

  protected activeNoteCategory = signal(this.noteCategoryOptions[0]);
  private notes: WritableSignal<INote[]> = signal([]);

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading.set(true);
    this.error.set('');

    this.noteService.getMyNotes().subscribe({
      next: (notes) => {
        const mappedNotes = notes.map(note => {
          const isExpired = note.expires_at ? new Date(note.expires_at) < new Date() : false;

          return {
            id: note.id,
            link: `${window.location.origin}/note/${note.id}`,
            createdDate: this.formatDate(note.created_at),
            expirationDate: note.expires_at ? this.formatDate(note.expires_at) : null,
            isExpired
          } as INote;
        });

        this.notes.set(mappedNotes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('خطا در بارگذاری نویسه‌ها');
        this.loading.set(false);
        console.error('Error loading notes:', err);
      }
    });
  }

  formatDate(dateString: string): IDate {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fa-IR'),
      time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };
  }
  protected notesByCategory = computed(() => {
    switch(this.activeNoteCategory()?.id) {
      case NoteCategory.ALL_NOTES:
        return this.notes();
      case NoteCategory.ACTIVE_NOTES:
        return this.notes().filter(note => !note.isExpired);
      case NoteCategory.EXPIRED_NOTES:
        return this.notes().filter(note => note.isExpired);
      default:
        return this.notes();
    }
  });

  protected copyToClipboard(link: string, event: MouseEvent) {
    navigator.clipboard.writeText(link).then(() => {
      const target = event.target as HTMLElement;
      target.classList.add('copied');
      setTimeout(() => {
        target.classList.remove('copied');
      }, 150);
    });
  }

  deleteNote(noteId: string): void {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این نویسه را حذف کنید؟')) {
      return;
    }

    this.deletingNoteId.set(noteId);

    this.noteService.deleteNote(noteId).subscribe({
      next: () => {
        // Remove the note from the list
        const updatedNotes = this.notes().filter(note => note.id !== noteId);
        this.notes.set(updatedNotes);
        this.deletingNoteId.set(null);
      },
      error: (err) => {
        console.error('Error deleting note:', err);
        alert('خطا در حذف نویسه');
        this.deletingNoteId.set(null);
      }
    });
  }
}
