import { Component, OnInit } from '@angular/core';
import { GalleryImage } from '../../models/gallery-image.model';
import { GalleryService, uploadProgressPercent } from '../../services/gallery.service';

const MAX_PARALLEL_UPLOADS = 10;

interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  errorMessage?: string;
}

@Component({
  selector: 'app-gallery-manager',
  templateUrl: './gallery-manager.component.html',
  styleUrls: ['./gallery-manager.component.scss']
})
export class GalleryManagerComponent implements OnInit {
  images: GalleryImage[] = [];
  loading = true;
  errorMessage = '';

  caption = '';
  uploadTasks: UploadTask[] = [];

  editingId: string | null = null;
  editCaption = '';
  editFile: File | null = null;
  editFileName = '';
  saving = false;
  editError = '';

  deletingId: string | null = null;

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.loading = true;
    this.errorMessage = '';
    this.galleryService.getImages().subscribe({
      next: (images) => {
        this.images = images;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load gallery images.';
        this.loading = false;
      }
    });
  }

  get uploading(): boolean {
    return this.uploadTasks.some((task) => task.status === 'uploading');
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) {
      return;
    }

    const selected = files.slice(0, MAX_PARALLEL_UPLOADS);
    input.value = '';

    selected.forEach((file) => this.uploadOne(file));
  }

  private uploadOne(file: File): void {
    const task: UploadTask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    };
    this.uploadTasks = [...this.uploadTasks, task];

    this.galleryService.uploadImageWithProgress(file, this.caption).subscribe({
      next: (event) => {
        const percent = uploadProgressPercent(event);
        if (percent !== null) {
          task.progress = percent;
        } else if ('body' in event && event.body) {
          this.images = [event.body, ...this.images];
          task.status = 'done';
          task.progress = 100;
          this.removeTaskSoon(task.id);
        }
      },
      error: () => {
        task.status = 'error';
        task.errorMessage = 'Upload failed.';
      }
    });
  }

  private removeTaskSoon(id: string): void {
    setTimeout(() => {
      this.uploadTasks = this.uploadTasks.filter((t) => t.id !== id);
    }, 1200);
  }

  dismissTask(id: string): void {
    this.uploadTasks = this.uploadTasks.filter((t) => t.id !== id);
  }

  startEdit(image: GalleryImage): void {
    this.editingId = image.id;
    this.editCaption = image.caption || '';
    this.editFile = null;
    this.editFileName = '';
    this.editError = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editFile = null;
    this.editFileName = '';
    this.editError = '';
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.editFile = file;
      this.editFileName = file.name;
    }
  }

  saveEdit(image: GalleryImage): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.editError = '';
    this.galleryService.updateImage(image.id, { caption: this.editCaption, file: this.editFile || undefined }).subscribe({
      next: (updated) => {
        this.images = this.images.map((img) => (img.id === updated.id ? updated : img));
        this.saving = false;
        this.cancelEdit();
      },
      error: () => {
        this.editError = 'Could not save changes. Please try again.';
        this.saving = false;
      }
    });
  }

  deleteImage(image: GalleryImage): void {
    if (!confirm('Remove this image from the gallery?')) {
      return;
    }

    this.deletingId = image.id;
    this.galleryService.deleteImage(image.id).subscribe({
      next: () => {
        this.images = this.images.filter((img) => img.id !== image.id);
        this.deletingId = null;
      },
      error: () => {
        this.errorMessage = 'Could not delete this image. Please try again.';
        this.deletingId = null;
      }
    });
  }
}
