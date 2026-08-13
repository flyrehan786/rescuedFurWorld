import { Cat } from '../models/cat.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CatPayload = Omit<Cat, 'id'>;

export interface CatsPage {
  items: Cat[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class CatsService {
  private readonly baseUrl = `${environment.apiUrl}/cats`;

  constructor(private http: HttpClient) {}

  getCats(): Observable<Cat[]> {
    return this.http.get<Cat[]>(this.baseUrl);
  }

  getCatsPage(page: number, pageSize: number): Observable<CatsPage> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<CatsPage>(this.baseUrl, { params });
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
