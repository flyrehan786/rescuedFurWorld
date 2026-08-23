import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GalleryImage } from '../models/gallery-image.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  constructor(private http: HttpClient) {}

  getImages(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${environment.apiUrl}/gallery`);
  }

  uploadImage(file: File, caption = ''): Observable<GalleryImage> {
    const formData = new FormData();
    formData.append('image', file);
    if (caption) {
      formData.append('caption', caption);
    }
    return this.http.post<GalleryImage>(`${environment.apiUrl}/gallery`, formData);
  }

  deleteImage(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/gallery/${id}`);
  }
}
