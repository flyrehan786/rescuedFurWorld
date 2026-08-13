import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { LoginComponent } from './login/login.component';
import { CatListComponent } from './cat-list/cat-list.component';
import { CatFormComponent } from './cat-form/cat-form.component';
import { CatPreviewComponent } from './cat-preview/cat-preview.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    LoginComponent,
    CatListComponent,
    CatFormComponent,
    CatPreviewComponent,
    SettingsComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, QuillModule.forRoot(), AdminRoutingModule]
})
export class AdminModule {}
