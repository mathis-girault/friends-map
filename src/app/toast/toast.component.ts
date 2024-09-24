import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../service/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html', // Pointing to the existing HTML
  styleUrls: ['./toast.component.css']   // You can style this as needed
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  remove(toast: { message: string, type: 'error' | 'success' }) {
    this.toastService.removeToast(toast);
  }
}
