import { Cat } from '../models/cat.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CatPayload = Omit<Cat, 'id'>;

@Injectable({ providedIn: 'root' })
export class CatsService {
  private readonly baseUrl = `${environment.apiUrl}/cats`;

  constructor(private http: HttpClient) {}

  getCats(): Observable<Cat[]> {
    return this.http.get<Cat[]>(this.baseUrl);
  }

  getCat(id: string): Observable<Cat> {
    return this.http.get<Cat>(`${this.baseUrl}/${id}`);
  }

  createCat(payload: CatPayload): Observable<Cat> {
    return this.http.post<Cat>(this.baseUrl, payload);
  }

  updateCat(id: string, payload: CatPayload): Observable<Cat> {
    return this.http.put<Cat>(`${this.baseUrl}/${id}`, payload);
  }

  deleteCat(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
