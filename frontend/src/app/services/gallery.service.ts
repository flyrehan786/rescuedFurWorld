import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
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

  /** Uploads with upload-progress events, for driving a per-file progress bar. */
  uploadImageWithProgress(file: File, caption = ''): Observable<HttpEvent<GalleryImage>> {
    const formData = new FormData();
    formData.append('image', file);
    if (caption) {
      formData.append('caption', caption);
    }
    return this.http.post<GalleryImage>(`${environment.apiUrl}/gallery`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  updateImage(id: string, changes: { caption?: string; file?: File }): Observable<GalleryImage> {
    const formData = new FormData();
    if (changes.caption !== undefined) {
      formData.append('caption', changes.caption);
    }
    if (changes.file) {
      formData.append('image', changes.file);
    }
    return this.http.put<GalleryImage>(`${environment.apiUrl}/gallery/${id}`, formData);
  }

  deleteImage(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/gallery/${id}`);
  }
}

export function uploadProgressPercent(event: HttpEvent<unknown>): number | null {
  if (event.type === HttpEventType.UploadProgress && event.total) {
    return Math.round((event.loaded / event.total) * 100);
  }
  return null;
}
