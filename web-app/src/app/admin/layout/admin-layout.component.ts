import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  constructor(private authService: AuthService, private router: Router, private themeService: ThemeService) {}

  get username(): string | null {
    return this.authService.username;
  }

  get photo(): string | null {
    return this.authService.photo;
  }

  get isDarkTheme(): boolean {
    return this.themeService.theme === 'dark';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
