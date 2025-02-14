import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../service/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html', // Pointing to the existing HTML
  styleUrls: ['./toast.component.css']   // You can style this as needed
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  remove(toast: Toast) {
    this.toastService.removeToast(toast);
  }
}
