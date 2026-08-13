import { Component, OnInit } from '@angular/core';
import { Cat } from '../../models/cat.model';
import { CatsService } from '../../services/cats.service';

@Component({
  selector: 'app-cat-list',
  templateUrl: './cat-list.component.html',
  styleUrls: ['./cat-list.component.scss']
})
export class CatListComponent implements OnInit {
  cats: Cat[] = [];
  loading = true;
  errorMessage = '';
  deletingId: string | null = null;

  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;
  readonly pageSizeOptions = [5, 10, 20];

  constructor(private catsService: CatsService) {}

  ngOnInit(): void {
    this.loadCats();
  }

  loadCats(): void {
    this.loading = true;
    this.catsService.getCatsPage(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.cats = res.items;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.page = res.page;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load cats. Please try again.';
        this.loading = false;
      }
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }
    this.page = page;
    this.loadCats();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.loadCats();
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(/[^a-z]+/g, '-');
  }

  deleteCat(cat: Cat): void {
    if (!confirm(`Delete ${cat.name}'s profile? This cannot be undone.`)) {
      return;
    }
    this.deletingId = cat.id;
    this.catsService.deleteCat(cat.id).subscribe({
      next: () => {
        this.deletingId = null;
        // reload current page (fall back a page if it just became empty)
        if (this.cats.length === 1 && this.page > 1) {
          this.page -= 1;
        }
        this.loadCats();
      },
      error: () => {
        this.errorMessage = 'Could not delete this cat. Please try again.';
        this.deletingId = null;
      }
    });
  }
}
