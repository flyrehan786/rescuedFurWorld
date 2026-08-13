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

  constructor(private catsService: CatsService) {}

  ngOnInit(): void {
    this.loadCats();
  }

  loadCats(): void {
    this.loading = true;
    this.catsService.getCats().subscribe({
      next: (cats) => {
        this.cats = cats;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load cats. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteCat(cat: Cat): void {
    if (!confirm(`Delete ${cat.name}'s profile? This cannot be undone.`)) {
      return;
    }
    this.deletingId = cat.id;
    this.catsService.deleteCat(cat.id).subscribe({
      next: () => {
        this.cats = this.cats.filter((c) => c.id !== cat.id);
        this.deletingId = null;
      },
      error: () => {
        this.errorMessage = 'Could not delete this cat. Please try again.';
        this.deletingId = null;
      }
    });
  }
}
