import { Component, ViewChild } from '@angular/core';
import { MapComponent, MarkerData } from './map/map.component';
import { MapFormComponent } from './map-form/map-form.component';
import { ToastComponent } from './toast/toast.component';
import { CommonModule } from '@angular/common';
import { GetPwdComponent } from './get-pwd/get-pwd.component';
import { DatabaseService } from './service/database.service';
import { ToastService } from './service/toast.service';
import { JourneyFormComponent } from './journey-form/journey-form.component';
import { JourneyService } from './service/journey.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapComponent, MapFormComponent, ToastComponent, CommonModule, GetPwdComponent, JourneyFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  showFormMarker: boolean = false;
  showFormJourney: boolean = false;
  showPwdForm: boolean = true;

  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(JourneyFormComponent) journeyFormComponent!: JourneyFormComponent;

  constructor(
    private databaseService: DatabaseService,
    private journeyService: JourneyService,
    private toastService: ToastService) {}

  toggleFormMarker(): void {
    this.showFormMarker = !this.showFormMarker;
    this.showFormJourney = false;
  }
  
  handleAddMarkerEvent(event: MarkerData): void {
    this.mapComponent.handleAddMarkerEvent(event);
    this.showFormMarker = false;
  }

  closeFormMarkerEvent(): void {
    this.showFormMarker = false;
  }

  toggleJourneyForm(): void {
    this.showFormJourney = !this.showFormJourney;
    this.showFormMarker = false;
  }

  closeMapFormEvent(): void {
    // this.showFormJourney = false;
    this.showFormMarker = false;
  }

  closeJourneyFormEvent(): void {
    // this.showFormJourney = false;
    this.showFormJourney = false;
  }

  async handleGetPassword(event: { firebaseApiKey: string, IDFMobiApiKey: string }): Promise<void> {
    this.databaseService.initApp(event.firebaseApiKey).then(() => {
      // Successfull authentication to firebase
      console.log("Successfully authenticated to Firebase");
      this.toastService.addToast('success', "Bienvenue sur l'application !");
      this.showPwdForm = false;
      this.mapComponent.initMarkers();
    }).catch(() => {
      // Failed authentication to firebase
      console.error("Failed to authenticate to Firebase");
      this.toastService.addToast('error', "Erreur de communication avec la base de données");
    });
    this.journeyService.initApp(event.IDFMobiApiKey);
  }

  onOriginSelected(event: MarkerData): void {
    this.showFormJourney = true;
    this.showFormMarker = false;
    this.journeyFormComponent.handleOriginSelected(event);
  }

  onDestSelected(event: MarkerData): void {
    this.showFormJourney = true;
    this.showFormMarker = false;
    this.journeyFormComponent.handleDestSelected(event);
  }
}
