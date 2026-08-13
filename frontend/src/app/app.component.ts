import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rescue-fur-world';
  isAdminRoute = false;

  constructor(private router: Router) {
    // Admin section renders its own header/footer via AdminLayoutComponent
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.isAdminRoute = this.router.url.startsWith('/admin');
    });
  }
}
