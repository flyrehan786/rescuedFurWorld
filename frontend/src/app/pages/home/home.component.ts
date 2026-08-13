import { Component, OnInit } from '@angular/core';
import { Cat } from '../../models/cat.model';
import { CatsService } from '../../services/cats.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cats: Cat[] = [];
  expandedCatId: string | null = null;

  constructor(private catsService: CatsService) {}

  ngOnInit(): void {
    this.catsService.getCats().subscribe({
      next: (cats) => (this.cats = cats),
      error: () => (this.cats = [])
    });
  }

  toggleCat(id: string): void {
    this.expandedCatId = this.expandedCatId === id ? null : id;
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
}
