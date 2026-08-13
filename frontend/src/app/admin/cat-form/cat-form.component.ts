import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatsService } from '../../services/cats.service';
import { UploadService } from '../../services/upload.service';

const EVENT_TYPES = ['rescue', 'checkup', 'treatment', 'surgery', 'milestone'];
const STATUSES = ['Thriving', 'Under care', 'Looking for a home'];

@Component({
  selector: 'app-cat-form',
  templateUrl: './cat-form.component.html',
  styleUrls: ['./cat-form.component.scss']
})
export class CatFormComponent implements OnInit {
  catId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  errorMessage = '';

  eventTypes = EVENT_TYPES;
  statuses = STATUSES;

  quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => this.pickImage()
      }
    }
  };

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    emoji: ['🐱', Validators.required],
    tagline: ['', Validators.required],
    bio: ['', Validators.required],
    rescueDate: ['', Validators.required],
    status: [STATUSES[0], Validators.required],
    healthJourney: this.fb.array([])
  });

  private quill: any = null;

  constructor(
    private fb: FormBuilder,
    private catsService: CatsService,
    private uploadService: UploadService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.catId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.catId;

    if (this.isEditMode && this.catId) {
      this.loading = true;
      this.catsService.getCat(this.catId).subscribe({
        next: (cat) => {
          this.form.patchValue({
            name: cat.name,
            emoji: cat.emoji,
            tagline: cat.tagline,
            bio: cat.bio,
            rescueDate: cat.rescueDate,
            status: cat.status
          });
          cat.healthJourney.forEach((event) => this.healthJourney.push(this.buildEventGroup(event)));
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Could not load this cat.';
          this.loading = false;
        }
      });
    }
  }

  get healthJourney(): FormArray {
    return this.form.get('healthJourney') as FormArray;
  }

  buildEventGroup(event?: { date: string; title: string; description: string; type: string }): FormGroup {
    return this.fb.group({
      date: [event?.date || '', Validators.required],
      title: [event?.title || '', Validators.required],
      description: [event?.description || ''],
      type: [event?.type || 'milestone', Validators.required]
    });
  }

  addEvent(): void {
    this.healthJourney.push(this.buildEventGroup());
  }

  removeEvent(index: number): void {
    this.healthJourney.removeAt(index);
  }

  onEditorCreated(quill: any): void {
    this.quill = quill;
    quill.root.addEventListener('paste', (event: ClipboardEvent) => this.handlePaste(event));
  }

  private handlePaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) {
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          this.uploadAndInsert(file);
        }
        break;
      }
    }
  }

  private pickImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/gif,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        this.uploadAndInsert(file);
      }
    };
    input.click();
  }

  private uploadAndInsert(file: File): void {
    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        const range = this.quill?.getSelection(true);
        const index = range ? range.index : this.quill?.getLength();
        this.quill?.insertEmbed(index, 'image', res.url, 'user');
        this.quill?.setSelection(index + 1, 0);
      },
      error: () => {
        this.errorMessage = 'Image upload failed. Please try again.';
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const payload = this.form.value;

    const request$ = this.isEditMode && this.catId
      ? this.catsService.updateCat(this.catId, payload)
      : this.catsService.createCat(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/admin/cats']),
      error: () => {
        this.saving = false;
        this.errorMessage = 'Could not save this cat. Please check the form and try again.';
      }
    });
  }
}
