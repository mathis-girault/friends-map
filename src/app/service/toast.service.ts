import { Injectable } from '@angular/core';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: Toast[] = [];

  // Add a new toast notification
  addToast(type: 'success' | 'error', message: string, duration: number = 5000) {
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
