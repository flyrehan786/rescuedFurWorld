import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { LoginComponent } from './login/login.component';
import { CatListComponent } from './cat-list/cat-list.component';
import { CatFormComponent } from './cat-form/cat-form.component';
import { CatPreviewComponent } from './cat-preview/cat-preview.component';
import { SettingsComponent } from './settings/settings.component';
import { GalleryManagerComponent } from './gallery-manager/gallery-manager.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'cats', pathMatch: 'full' },
      { path: 'cats', component: CatListComponent },
      { path: 'cats/new', component: CatFormComponent },
      { path: 'cats/:id/edit', component: CatFormComponent },
      { path: 'cats/:id/preview', component: CatPreviewComponent },
      { path: 'gallery', component: GalleryManagerComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
