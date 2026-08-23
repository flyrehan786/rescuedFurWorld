import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { Cat } from '../../models/cat.model';
import { CatsService } from '../../services/cats.service';

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

  galleryImages: string[] = [];
  readonly galleryPageSize = 8;
  galleryPage = 1;

  constructor(private catsService: CatsService, private http: HttpClient) {}

  ngOnInit(): void {
    this.catsService.getCats().subscribe({
      next: (cats) => (this.cats = cats),
      error: () => (this.cats = [])
    });

    this.http
      .get<{ images: string[] }>('assets/gallery/manifest.json')
      .pipe(catchError(() => of({ images: [] as string[] })))
      .subscribe(({ images }) => {
        this.galleryImages = (images || []).map((name) => `assets/gallery/${name}`);
        this.galleryPage = 1;
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

  get pagedGalleryImages(): string[] {
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

  galleryTrackBy(_index: number, src: string): string {
    return src;
  }
}
