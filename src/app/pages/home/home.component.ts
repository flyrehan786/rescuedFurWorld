import { Component } from '@angular/core';
import { CATS } from '../../data/cats.data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  cats = CATS;
  expandedCatId: string | null = null;

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
