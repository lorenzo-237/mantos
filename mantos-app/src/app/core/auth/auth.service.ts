import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { LoginRequest, LoginResponse, UserInfo } from '../../models';

const TOKEN_KEY = 'mantos_token';
const USER_KEY = 'mantos_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Signal pour l'utilisateur connecté
  currentUser = signal<UserInfo | null>(this.getUserFromStorage());

  /**
   * Se connecter (local ou LDAP)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUser(response.user);
        this.currentUser.set(response.user);
      })
    );
  }

  /**
   * Se déconnecter
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Récupérer le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Sauvegarder le token
   */
  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Sauvegarder l'utilisateur
   */
  private setUser(user: UserInfo): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Récupérer l'utilisateur depuis le storage
   */
  private getUserFromStorage(): UserInfo | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.isAdmin ?? false;
  }

  /**
   * Récupérer les informations de l'utilisateur connecté depuis l'API
   */
  getMe(): Observable<UserInfo> {
    return this.apiService.get<UserInfo>('/users/me').pipe(
      tap(user => {
        this.setUser(user);
        this.currentUser.set(user);
      })
    );
  }

  /**
   * Mettre à jour l'utilisateur (thème, etc.)
   */
  updateUser(updates: Partial<UserInfo>): Observable<UserInfo> {
    return this.apiService.patch<UserInfo>('/users', updates).pipe(
      tap(user => {
        this.setUser(user);
        this.currentUser.set(user);
      })
    );
  }
}
