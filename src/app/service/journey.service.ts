import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtilsService } from './utils.service';

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
        duration: number;
        display_informations: {
          commercial_mode: string;
          label: string;
          color: string;
          text_color: string;
        };
      }[];
}

export type POINT_COORDS = {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class JourneyService {
  private API_KEY: string | null = null;
  private readonly API_URL = "https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia/journeys?count=4&traveler_type=fast_walker";

  constructor(private http: HttpClient) {}

  initApp(apiKey: string): void {
    this.API_KEY = apiKey;
  }

  getJourneys(origin: POINT_COORDS, destination: POINT_COORDS): Observable<PRIM_IDF_API_RESULT> {
    const url = this.genBaseUrl(origin, destination);

    return this.callApi(url);
  }

  getDatedJourneys(origin: POINT_COORDS, destination: POINT_COORDS, dateRepresentsArrival: boolean, date: Date): Observable<PRIM_IDF_API_RESULT> {
    const url = this.genBaseUrl(origin, destination)
      + `&datetime_represents=${dateRepresentsArrival ? 'arrival' : 'departure'}`
      + `&datetime=${UtilsService.formatDate(date)}`;

    return this.callApi(url);
  }

  private callApi(url: string): Observable<PRIM_IDF_API_RESULT> {
    if (!this.API_KEY) {
      throw new Error("API key not initialized");
    }
    const headers = new HttpHeaders({
      'Apikey': this.API_KEY
    });

    return this.http.get<PRIM_IDF_API_RESULT>(url, { headers });
  }

  private genBaseUrl(origin: POINT_COORDS, destination: POINT_COORDS) {
    return `${this.API_URL}&from=${origin.y};${origin.x}&to=${destination.y};${destination.x}`;
  }
}
