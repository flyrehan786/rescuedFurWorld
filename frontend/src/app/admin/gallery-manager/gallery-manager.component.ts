import { Component, OnInit } from '@angular/core';
import { GalleryImage } from '../../models/gallery-image.model';
import { GalleryService } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery-manager',
  templateUrl: './gallery-manager.component.html',
  styleUrls: ['./gallery-manager.component.scss']
})
export class GalleryManagerComponent implements OnInit {
  images: GalleryImage[] = [];
  loading = true;
  errorMessage = '';

  uploading = false;
  uploadError = '';
  caption = '';

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadError = '';
    this.uploading = true;
    this.galleryService.uploadImage(file, this.caption).subscribe({
      next: (image) => {
        this.images = [image, ...this.images];
        this.caption = '';
        this.uploading = false;
        input.value = '';
      },
      error: () => {
        this.uploadError = 'Image upload failed. Please try again.';
        this.uploading = false;
        input.value = '';
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
