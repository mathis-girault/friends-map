import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MarkerData } from '../map/map.component';
import { Observable } from 'rxjs';

export type PRIM_IDF_API_RESULT = {
  journeys: PRIM_IDF_JOURNEY[]
}

export type PRIM_IDF_JOURNEY = {
    arrival_date_time: string;
    departure_date_time: string;
    duration: number;
    status: string;
    sections: {
        type: string;
        mode: string;
        display_informations: {
          commercial_mode: string;
          label: string;
          color: string;
          text_color: string;
        };
      }[];
}

@Injectable({
  providedIn: 'root'
})
export class JourneyService {
  private API_KEY: string | null = null;
  private readonly API_URL = "https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia/journeys?count=3&traveler_type=fast_walker";

  constructor(private http: HttpClient) {}

  initApp(apiKey: string): void {
    this.API_KEY = apiKey;
  }

  getJourneys(origin: MarkerData, destination: MarkerData): Observable<PRIM_IDF_API_RESULT> {
    if (!this.API_KEY) {
      throw new Error("API key not initialized");
    }
    const url = `${this.API_URL}&from=${origin.y};${origin.x}&to=${destination.y};${destination.x}`;
    const headers = new HttpHeaders({
      'Apikey': this.API_KEY
    });

    return this.http.get<PRIM_IDF_API_RESULT>(url, { headers });
  }
}