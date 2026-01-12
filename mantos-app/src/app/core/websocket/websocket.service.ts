import { Injectable, inject, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface UpdateIssueEvent {
  issue_id: number;
  user_id: number;
  action: string;
}

export interface AddVersionEvent {
  project_id: number;
  version: string;
}

export interface UpdateVuesEvent {
  user_id: number;
  view: string;
  filters: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private authService = inject(AuthService);
  private socket: Socket | null = null;
  private connected = false;

  // Subjects pour les différents events
  private updateIssue$ = new Subject<UpdateIssueEvent>();
  private addVersion$ = new Subject<AddVersionEvent>();
  private updateVues$ = new Subject<UpdateVuesEvent>();

  /**
   * Connecter au WebSocket
   */
  connect(): void {
    if (this.connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error('[WebSocket] No token available');
      return;
    }

    this.socket = io(environment.wsUrl, {
      extraHeaders: {
        access_token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      this.connected = false;
    });

    // Écouter les events
    this.socket.on('update_issue', (data: UpdateIssueEvent) => {
      this.updateIssue$.next(data);
    });

    this.socket.on('add_version', (data: AddVersionEvent) => {
      this.addVersion$.next(data);
    });

    this.socket.on('update_vues', (data: UpdateVuesEvent) => {
      this.updateVues$.next(data);
    });
  }

  /**
   * Déconnecter du WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Émettre un event update_issue
   */
  emitUpdateIssue(data: UpdateIssueEvent): void {
    if (this.socket) {
      this.socket.emit('update_issue', data);
    }
  }

  /**
   * Émettre un event add_version
   */
  emitAddVersion(data: AddVersionEvent): void {
    if (this.socket) {
      this.socket.emit('add_version', data);
    }
  }

  /**
   * Émettre un event update_vues
   */
  emitUpdateVues(data: UpdateVuesEvent): void {
    if (this.socket) {
      this.socket.emit('update_vues', data);
    }
  }

  /**
   * Observable pour update_issue
   */
  onUpdateIssue(): Observable<UpdateIssueEvent> {
    return this.updateIssue$.asObservable();
  }

  /**
   * Observable pour add_version
   */
  onAddVersion(): Observable<AddVersionEvent> {
    return this.addVersion$.asObservable();
  }

  /**
   * Observable pour update_vues
   */
  onUpdateVues(): Observable<UpdateVuesEvent> {
    return this.updateVues$.asObservable();
  }

  /**
   * Vérifier si connecté
   */
  isConnected(): boolean {
    return this.connected;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
