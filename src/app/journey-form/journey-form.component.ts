import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../service/toast.service';
import { JourneyService, type PRIM_IDF_API_RESULT, type PRIM_IDF_JOURNEY } from '../service/journey.service';
import { MarkerData } from '../map/map.component';

@Component({
  selector: 'app-journey-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './journey-form.component.html',
  styleUrls: ['./journey-form.component.css']
})
export class JourneyFormComponent {
  addJourneyForm: FormGroup;
  origin: MarkerData | null = null;
  dest: MarkerData | null = null;
  results: PRIM_IDF_JOURNEY[] = [];

  @Output() closeJourneyFormEvent = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder, 
    private toastService: ToastService,
    private journeyService: JourneyService
  ) {
    // Initialize the form with form controls and validators
    this.addJourneyForm = this.fb.group({
      origin: ['', Validators.required],
      dest: ['', Validators.required],
    });
  }

  handleOriginSelected(event: MarkerData): void {
    this.origin = event;
    this.results = [];
  }

  handleDestSelected(event: MarkerData): void {
    this.dest = event;
    this.results = [];
  }

  toggleSearch(): void {
    if (this.origin && this.dest) {
      if (this.origin.name === this.dest.name) {
        this.toastService.addToast('error', 'Les deux points de départ et d\'arrivée sont identiques');
      } else {
        this.journeyService.getJourneys(this.origin, this.dest).subscribe({
          next: (data) => {
            this.handleResults(data);
          },
          error: (error) => {
            this.toastService.addToast('error', `Une erreur est survenue : \n${error.message}`);
          }
        });
      }
    } else {
      this.toastService.addToast('error', 'Veuillez sélectionner un point de départ et un point d\'arrivée');
    }
  }

  handleResults(data: PRIM_IDF_API_RESULT): void {
    const journeys = data.journeys;
    journeys.forEach((journey: PRIM_IDF_JOURNEY) => {
        journey.sections = journey.sections.filter((section) => section.type === 'public_transport' || section.mode === 'walking');
    });
    console.info("API results: ", journeys);
    this.results = journeys;
  }

  onClose(): void {
    this.closeJourneyFormEvent.emit();
  }

  formatTime(dateTime: string): string {
    const formattedDateTime = `${dateTime.slice(0, 4)}-${dateTime.slice(4, 6)}-${dateTime.slice(6, 8)}T${dateTime.slice(9, 11)}:${dateTime.slice(11, 13)}:${dateTime.slice(13, 15)}`;
    const date = new Date(formattedDateTime);
    // return date.toLocaleTimeString([], { hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return date.toLocaleTimeString([], { hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const formattedHours = hours > 0 ? `${hours}h` : '';
    const formattedMinutes = (minutes > 0 || (hours > 0 && seconds > 0)) ? (hours > 0 ? String(minutes).padStart(2, '0') : minutes) + 'min' : '';

    return `${formattedHours}${formattedMinutes}`.trim();
  }

  isTrain(commercialMode: string): boolean {
    return commercialMode.startsWith('Train') || commercialMode === 'RER';
  }

  displayWarning(warning: string): void {
    this.toastService.addToast('warning', warning);
  }
}
