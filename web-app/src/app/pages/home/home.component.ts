import { Component, OnInit } from '@angular/core';
import { Cat } from '../../models/cat.model';
import { GalleryImage } from '../../models/gallery-image.model';
import { CatsService } from '../../services/cats.service';
import { GalleryService } from '../../services/gallery.service';
import { SiteContentService } from '../../services/site-content.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cats: Cat[] = [];
  selectedCat: Cat | null = null;

  readonly catsPageSize = 6;
  catsPage = 1;

  galleryImages: GalleryImage[] = [];
  readonly galleryPageSize = 8;
  galleryPage = 1;

  readonly defaultAboutPhoto = 'assets/about.jpg';
  aboutPhotoUrl = this.defaultAboutPhoto;

  constructor(
    private catsService: CatsService,
    private galleryService: GalleryService,
    private siteContentService: SiteContentService
  ) {}

  ngOnInit(): void {
    this.catsService.getCats().subscribe({
      next: (cats) => (this.cats = cats),
      error: () => (this.cats = [])
    });

    this.galleryService.getImages().subscribe({
      next: (images) => {
        this.galleryImages = images || [];
        this.galleryPage = 1;
      },
      error: () => (this.galleryImages = [])
    });

    this.siteContentService.getAboutPhoto().subscribe({
      next: (res) => (this.aboutPhotoUrl = res.url || this.defaultAboutPhoto),
      error: () => (this.aboutPhotoUrl = this.defaultAboutPhoto)
    });
  }

  openCat(cat: Cat): void {
    this.selectedCat = cat;
    document.body.classList.add('no-scroll');
  }

  closeCat(): void {
    this.selectedCat = null;
    document.body.classList.remove('no-scroll');
  }

  catTrackBy(_index: number, cat: Cat): string {
    return cat.id;
  }

  iconFor(type: string): string {
    switch (type) {
      case 'rescue':
        return '🆘';
      case 'checkup':
        return '🩺';
      case 'treatment':
        return '💊';
      case 'surgery':
        return '🏥';
      case 'milestone':
        return '🎉';
      default:
        return '📌';
    }
  }

  get catsTotalPages(): number {
    return Math.max(1, Math.ceil(this.cats.length / this.catsPageSize));
  }

  get pagedCats(): Cat[] {
    const start = (this.catsPage - 1) * this.catsPageSize;
    return this.cats.slice(start, start + this.catsPageSize);
  }

  get catsPageNumbers(): number[] {
    return Array.from({ length: this.catsTotalPages }, (_, i) => i + 1);
  }

  goToCatsPage(page: number): void {
    if (page < 1 || page > this.catsTotalPages) {
      return;
    }
    this.catsPage = page;
    const el = document.getElementById('cats');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  prevCatsPage(): void {
    this.goToCatsPage(this.catsPage - 1);
  }

  nextCatsPage(): void {
    this.goToCatsPage(this.catsPage + 1);
  }

  get galleryTotalPages(): number {
    return Math.max(1, Math.ceil(this.galleryImages.length / this.galleryPageSize));
  }

  get pagedGalleryImages(): GalleryImage[] {
    const start = (this.galleryPage - 1) * this.galleryPageSize;
    return this.galleryImages.slice(start, start + this.galleryPageSize);
  }

  get galleryPageNumbers(): number[] {
    return Array.from({ length: this.galleryTotalPages }, (_, i) => i + 1);
  }

  goToGalleryPage(page: number): void {
    if (page < 1 || page > this.galleryTotalPages) {
      return;
    }
    this.galleryPage = page;
    const el = document.getElementById('gallery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  prevGalleryPage(): void {
    this.goToGalleryPage(this.galleryPage - 1);
  }

  nextGalleryPage(): void {
    this.goToGalleryPage(this.galleryPage + 1);
  }

  galleryTrackBy(_index: number, image: GalleryImage): string {
    return image.id;
  }
}
