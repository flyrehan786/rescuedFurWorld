import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cat } from '../../models/cat.model';
import { CatsService } from '../../services/cats.service';

@Component({
  selector: 'app-cat-preview',
  templateUrl: './cat-preview.component.html',
  styleUrls: ['./cat-preview.component.scss']
})
export class CatPreviewComponent implements OnInit {
  cat: Cat | null = null;
  loading = true;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private catsService: CatsService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Cat not found.';
      this.loading = false;
      return;
    }
    this.catsService.getCat(id).subscribe({
      next: (cat) => {
        this.cat = cat;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load this cat.';
        this.loading = false;
      }
    });
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
