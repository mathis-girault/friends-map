import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../service/toast.service';
import { JourneyService, POINT_COORDS, type PRIM_IDF_API_RESULT, type PRIM_IDF_JOURNEY } from '../service/journey.service';
import { MarkerData } from '../map/map.component';
import { AddressService } from '../service/address.service';
import { UtilsService } from '../service/utils.service';

@Component({
  selector: 'app-journey-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './journey-form.component.html',
  styleUrls: ['./journey-form.component.css']
})
export class JourneyFormComponent implements OnInit {
  addJourneyForm: FormGroup;
  origin: string = '';
  dest: string = '';
  searchCoords: { origin: POINT_COORDS | null, dest: POINT_COORDS | null } = { origin: null, dest: null };
  results: PRIM_IDF_JOURNEY[] = [];

  formatTime = UtilsService.formatTime;
  formatDuration = UtilsService.formatDuration;
  durationToMinutes = UtilsService.durationToMinutes;

  @Output() closeJourneyFormEvent = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder, 
    private toastService: ToastService,
    private journeyService: JourneyService,
    private addressService: AddressService
  ) {
    this.addJourneyForm = this.fb.group({
      origin: ['', Validators.required],
      dest: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.addJourneyForm.get('origin')?.valueChanges.subscribe(() => {
      this.searchCoords.origin = null;
      this.results = [];
    });

    this.addJourneyForm.get('dest')?.valueChanges.subscribe(() => {
      this.searchCoords.dest = null;
      this.results = [];
    });
  }

  handleOriginSelected(event: MarkerData): void {
    this.origin = event.address;
    this.searchCoords.origin = event;
    this.results = [];
  }

  handleDestSelected(event: MarkerData): void {
    this.dest = event.address;
    this.searchCoords.dest = event;
    this.results = [];
  }

  async toggleSearch(): Promise<void> {
    await this.handleUserInputs();

    if (!this.searchCoords.origin || !this.searchCoords.dest) {
      this.toastService.addToast('error', 'Veuillez sélectionner un point de départ et un point d\'arrivée');
      return;
    }

    if (this.searchCoords.origin.x === this.searchCoords.dest.x && this.searchCoords.origin.y === this.searchCoords.dest.y) {
        this.toastService.addToast('error', 'Les deux points de départ et d\'arrivée sont identiques');
        return;
    }

    this.journeyService.getJourneys(this.searchCoords.origin, this.searchCoords.dest).subscribe({
      next: (data) => {
        this.handleResults(data);
      },
      error: (error) => {
        this.toastService.addToast('error', `Une erreur est survenue : \n${error.message}`);
      }
    });
  }

  async handleUserInputs() {
    if (!this.searchCoords.origin) {
      const userOrigin = this.addJourneyForm.get('origin')?.value;
      console.log("Getting coords for origin : ", userOrigin);
      await this.addressService.getPosition(userOrigin).then((pos) => {
        this.searchCoords.origin = {
          x: pos.x,
          y: pos.y
        };
      }).catch((error) => {
        this.toastService.addToast('error', `Une erreur est survenue : \n${error.message}`);
      });
    }
    if (!this.searchCoords.dest) {
      const userDest = this.addJourneyForm.get('dest')?.value;
      console.log("Getting coords for dest : ", userDest);
      await this.addressService.getPosition(userDest).then((pos) => {
        this.searchCoords.dest = {
          x: pos.x,
          y: pos.y
        };
      }).catch((error) => {
        this.toastService.addToast('error', `Une erreur est survenue : \n${error.message}`);
      });
    }
  }

  handleResults(data: PRIM_IDF_API_RESULT): void {
    const journeys = data.journeys;
    journeys.forEach((journey: PRIM_IDF_JOURNEY) => {
        journey.sections = journey.sections.filter((section) => section.type === 'public_transport' || section.mode === 'walking');
    });
    journeys.pop(); // get 4 journeys and remove last
    console.info("API results: ", journeys);
    this.results = journeys;
  }

  onClose(): void {
    this.closeJourneyFormEvent.emit();
  }

  isTrain(commercialMode: string): boolean {
    return commercialMode.startsWith('Train') || commercialMode === 'RER';
  }

  displayWarning(warning: string): void {
    this.toastService.addToast('warning', warning);
  }
}
