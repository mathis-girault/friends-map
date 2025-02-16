import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
  private readonly BASE_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

  constructor(private http: HttpClient) {}

  getSuggestions(searchValue: string): Observable<{ features: GOUV_API_DATA[] }> {
    if (searchValue.length < 3) {
      return of();
    }

    const url = `${this.BASE_GOUV_URL}&q=${searchValue}`;

    return this.http.get<{ features: GOUV_API_DATA[] }>(url);
  }

  getPosition(address: string): Observable<L.Point | null> {
    const baseUrl = "https://nominatim.openstreetmap.org/search";
  
    return this.http.get<NOMINATIM_API_DATA>(`${baseUrl}?format=geojson&limit=1&q=${address}`).pipe(
      map(response => {
        if (response.features.length > 0) {
          return new L.Point(
            parseFloat(response.features[0].geometry.coordinates[1].toString()),
            parseFloat(response.features[0].geometry.coordinates[0].toString())
          );
        } else {
          throw new Error("Aucune adresse ne correspond à votre recherche");
        }
      }),
      catchError(error => {
        console.error('Error:', error);
        return of(null);
      })
    );
  }
}