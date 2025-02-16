import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkerData } from '../map/map.component';
import { ToastService } from '../service/toast.service';
import { AddressService } from '../service/address.service';

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
    private toastService: ToastService,
    private addressService: AddressService
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

    const suggestions = this.addressService.getSuggestions(searchValue);
    suggestions.pipe().subscribe({
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
      this.addressService.getPosition(formValue.address).then((response) => {
        this.addMarkerEvent.emit({
          name: formValue.name,
          address: formValue.address,
          x: response.x,
          y: response.y
        });
      }).catch((error) => {
        this.toastService.addToast('error', error.message, 5000);
      });
    }
  }

  onClose(): void {
    this.closeFormEvent.emit();
  }
}
