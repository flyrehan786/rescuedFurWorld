import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  year = new Date().getFullYear();

  constructor(private themeService: ThemeService) {}

  get isDarkTheme(): boolean {
    return this.themeService.theme === 'dark';
  }
}
