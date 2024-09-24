import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MarkerData } from '../map/map.component';
import { ToastService } from '../service/toast.service';

interface NominatimResponse {
  features: {
    geometry: {
      coordinates: [number, number];
    }
  }[];
}

interface GouvApiData {
  properties: {
    label: string;
  };
}

@Component({
  selector: 'app-map-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './map-form.component.html',
  styleUrls: ['./map-form.component.css']
})
export class MapFormComponent {
  addMarkerForm: FormGroup;
  suggestions: string[] = [];
  isFrance: boolean = true;

  // Emit the form data to the parent component
  @Output() addMarkerEvent = new EventEmitter<MarkerData>();

  @Output() closeFormEvent = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private toastService: ToastService
  ) {
    // Initialize the form with form controls and validators
    this.addMarkerForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      country: ['france'] // default selection is France
    });
    
    // Subscribe to changes on the country field to determine if France is selected
    this.addMarkerForm.get('country')?.valueChanges.subscribe(value => {
      this.isFrance = value === 'france';
      if (!this.isFrance) {
        this.suggestions = [];
      }
    });
  }

  // Handle input event to fetch suggestions
  handleSuggestions(): void {
    if (!this.isFrance) return; // Only fetch suggestions if France is selected

    const searchValue = this.addMarkerForm.value.address.trim();

    if (searchValue.length < 3) {
      this.suggestions = [];
      return;
    }

    const baseURL = 'https://api-adresse.data.gouv.fr/search/?limit=5';
    this.http.get<{ features: GouvApiData[] }>(`${baseURL}&q=${searchValue}`).subscribe({
      next: (response) => {
        this.suggestions = response.features.map((feature) => feature.properties.label);
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });
  }

  // Handle suggestion click
  selectSuggestion(suggestion: string): void {
    this.addMarkerForm.controls['address'].setValue(suggestion);
    this.suggestions = []; // Clear suggestions
  }

  // Handle the form submission
  onSubmit(): void {
    if (this.addMarkerForm.valid) {
      const formValue = this.addMarkerForm.value;
      this.getPosFromAddress(formValue.address).then((pos) => {
        this.addMarkerEvent.emit({
          name: formValue.name,
          address: formValue.address,
          x: pos.x,
          y: pos.y
        });
      }).catch((error) => {
        this.toastService.addToast('error', error.message, 5000);
      });
    }
  }

  onClose(): void {
    this.closeFormEvent.emit();
  }

  getPosFromAddress(text: string): Promise<L.Point> {
    const baseUrl = "https://nominatim.openstreetmap.org/search";
  
    return new Promise((resolve, reject) => {
      this.http.get<NominatimResponse>(`${baseUrl}?format=geojson&limit=1&q=${text}`).subscribe({
        next: (response) => {
          if (response.features.length > 0) {
            const pos = new L.Point(
              parseFloat(response.features[0].geometry.coordinates[1].toString()),
              parseFloat(response.features[0].geometry.coordinates[0].toString())
            );
            resolve(pos);
          } else {
            reject(new Error("Aucune adresse ne correspond à votre recherche"));
          }
        },
        error: (error) => {
          console.log("Error: ", error);
          reject(error);
        },
      });
    });
  }
}
