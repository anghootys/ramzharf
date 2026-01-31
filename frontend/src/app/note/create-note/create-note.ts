import {Component, computed, inject, signal} from '@angular/core';
import {Page} from '../../ui/page/page';
import {Editor} from 'primeng/editor';
import {Step, StepItem, StepPanel, Stepper} from 'primeng/stepper';
import {Button} from 'primeng/button';
import {FloatLabel} from 'primeng/floatlabel';
import {Select} from 'primeng/select';
import {FormsModule} from '@angular/forms';
import {Password} from 'primeng/password';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {Badge} from 'primeng/badge';
import {DomSanitizer} from '@angular/platform-browser';
import {Fieldset} from 'primeng/fieldset';
import { NoteService } from '../../services/note.service';
import { Router } from '@angular/router';

interface ExpTime {
  time: string;
  id: number;
  ms?: number; // milliseconds
}

@Component({
  selector: 'app-create-note',
  imports: [
    Page,
    Editor,
    Stepper,
    StepItem,
    Step,
    StepPanel,
    Button,
    FloatLabel,
    Select,
    FormsModule,
    Password,
    ToastModule,
    Badge,
    Fieldset
  ],
  providers: [MessageService],
  templateUrl: './create-note.html',
  styleUrl: './create-note.scss',
})
export class CreateNote {

  private messageService = inject(MessageService);
  private domSanitizer = inject(DomSanitizer);
  private noteService = inject(NoteService);
  private router = inject(Router);

  protected expTimes: ExpTime[] = [
    { id: 1, time: "۱۰ دقیقه", ms: 10 * 60 * 1000 },
    { id: 2, time: "۳۰ دقیقه", ms: 30 * 60 * 1000 },
    { id: 3, time: "۱ ساعت", ms: 60 * 60 * 1000 },
    { id: 4, time: "۶ ساعت", ms: 6 * 60 * 60 * 1000 },
    { id: 5, time: "۱۲ ساعت", ms: 12 * 60 * 60 * 1000 },
    { id: 6, time: "۱ روز", ms: 24 * 60 * 60 * 1000 },
    { id: 7, time: "۱۰ روز", ms: 10 * 24 * 60 * 60 * 1000 },
    { id: 8, time: "۳۰ روز", ms: 30 * 24 * 60 * 60 * 1000 },
    { id: 9, time: "هیچگاه" }
  ];

  protected noteContent = signal("");
  protected expTime = signal(this.expTimes[this.expTimes.length - 1]);
  protected notePassword = signal("");
  protected creatingNote = signal(false);

  protected editorDirection = computed(() => {
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

    const text = this.noteContent().trim();
    return text && rtlRegex.test(text) ? 'rtl' : 'ltr';
  });
  protected safeNoteContent = computed(() => this.domSanitizer.bypassSecurityTrustHtml(this.noteContent()))

  activateNoteConfigurationStep(activateCallback: CallableFunction) {
    if (this.noteContent().toString().trim().length == 0 || this.noteContent().toString().trim() == "<p></p>") {
      this.messageService.add({severity: 'error', summary: "خطا", detail: "متن نویسه نباید خالی باشد."});
      return;
    }

    activateCallback(2);
  }

  activateNoteReviewStep(activateCallback: CallableFunction) {
    if (this.expTime().toString().trim().length == 0 || this.notePassword().toString().trim().length == 0) {
      this.messageService.add({severity:'error', summary: 'هشدار', detail: 'لطفا زمان انقضا و رمز عبور نویسه را مشخص کنید.'});
      return;
    }

    activateCallback(3);
  }

  async createNote() {
    this.creatingNote.set(true);

    try {
      const content = this.noteContent();
      const password = this.notePassword();
      const expiresInMs = this.expTime().ms;

      if (!password) {
        this.messageService.add({
          severity: 'error',
          summary: 'خطا',
          detail: 'لطفا رمز عبور را وارد کنید'
        });
        this.creatingNote.set(false);
        return;
      }

      const observable = await this.noteService.createNote(content, password, expiresInMs);

      observable.subscribe({
        next: (note) => {
          this.messageService.add({
            severity: 'success',
            summary: 'موفق',
            detail: 'نویسه با موفقیت ایجاد شد'
          });

          setTimeout(() => {
            this.router.navigate(['/note', note.id]);
          }, 1500);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطا',
            detail: error.error?.error || 'ایجاد نویسه با خطا مواجه شد'
          });
          this.creatingNote.set(false);
        },
        complete: () => {
          this.creatingNote.set(false);
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: 'خطا در رمزنگاری نویسه'
      });
      this.creatingNote.set(false);
    }
  }

  getExpTimeTitle() : string {
    if (this.expTime().time == "هیچگاه") {
      return `نویسه هیچگاه منقضی نخواهد شد.`;
    } else {
      return `نویسه پس از گذشت ${this.expTime().time} منقضی خواهد شد.`;
    }
  }
}
