import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import * as L from 'leaflet';

type GOUV_API_DATA = {
  properties: {
    label: string;
  };
}

type NOMINATIM_API_DATA = {
  features: {
    geometry: {
      coordinates: [number, number];
    }
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly BASE_GOUV_URL = 'https://api-adresse.data.gouv.fr/search/?limit=5';
  private readonly BASE_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search?format=geojson&limit=1";

  constructor(private http: HttpClient) {}

  getSuggestions(searchValue: string): Observable<{ features: GOUV_API_DATA[] }> {
    if (searchValue.length < 3) {
      return of();
    }

    const url = `${this.BASE_GOUV_URL}&q=${searchValue}`;

    return this.http.get<{ features: GOUV_API_DATA[] }>(url);
  }

  getPosition(address: string): Promise<L.Point> {
    return new Promise((resolve, reject) => {
      this.http.get<NOMINATIM_API_DATA>(`${this.BASE_NOMINATIM_URL}&q=${address}`).subscribe({
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