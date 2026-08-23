import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'rfw_admin_token';
const USERNAME_KEY = 'rfw_admin_username';
const PHOTO_KEY = 'rfw_admin_photo';

export interface LoginResponse {
  token: string;
  username: string;
  photo?: string;
}

export interface ProfileResponse {
  token: string;
  username: string;
  photo: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USERNAME_KEY, res.username);
        localStorage.setItem(PHOTO_KEY, res.photo || '');
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(PHOTO_KEY);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }

  updateProfile(changes: { username?: string; photo?: string }): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${environment.apiUrl}/auth/profile`, changes).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USERNAME_KEY, res.username);
        localStorage.setItem(PHOTO_KEY, res.photo || '');
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get username(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  get photo(): string | null {
    return localStorage.getItem(PHOTO_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
