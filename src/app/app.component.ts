import { Component, ViewChild } from '@angular/core';
import { MapComponent, MarkerData } from './map/map.component';
import { MapFormComponent } from './map-form/map-form.component';
import { ToastComponent } from './toast/toast.component';
import { CommonModule } from '@angular/common';
import { GetPwdComponent } from './get-pwd/get-pwd.component';
import { DatabaseService } from './service/database.service';
import { ToastService } from './service/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapComponent, MapFormComponent, ToastComponent, CommonModule, GetPwdComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  showForm: boolean = false;
  showPwdForm: boolean = true;

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(private databaseService: DatabaseService, private toastService: ToastService) {}

  toggleForm(): void {
    this.showForm = !this.showForm;
  }
  
  handleAddMarkerEvent(event: MarkerData): void {
    this.mapComponent.handleAddMarkerEvent(event);
    this.showForm = false;
  }

  closeFormEvent(): void {
    this.showForm = false;
  }

  async handleGetPassword(event: string): Promise<void> {
    this.databaseService.initApp(event).then(() => {
      // Successfull authentication to firebase
      this.toastService.addToast('success', "Bienvenue sur l'application !");
      this.showPwdForm = false;
      this.mapComponent.initMarkers();
    }).catch(() => {
      // Failed authentication to firebase
      console.error("Failed to authenticate to Firebase");
      this.toastService.addToast('error', "Erreur de communication avec la base de données");
    });
  }
}
