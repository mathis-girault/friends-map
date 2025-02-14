import { Injectable } from '@angular/core';

export interface Toast {
  type: 'success' | 'warning' | 'error';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: Toast[] = [];

  // Add a new toast notification
  addToast(type: Toast['type'], message: Toast['message'], duration: number = 5000) {
    const toastToAdd = { type, message };
    this.toasts.push(toastToAdd);

    // Automatically remove the toast after 5 seconds
    setTimeout(() => this.removeToast(toastToAdd), duration);
  }

  // Remove a toast notification
  removeToast(toastToRemove: Toast) {
    this.toasts = this.toasts.filter(toast => toast !== toastToRemove);
  }
}
