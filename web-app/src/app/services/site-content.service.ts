import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  constructor(private http: HttpClient) {}

  getAboutPhoto(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${environment.apiUrl}/site/about-photo`);
  }

  updateAboutPhoto(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.put<{ url: string }>(`${environment.apiUrl}/site/about-photo`, formData);
  }
}
