import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MapFormComponent } from "../map-form/map-form.component";
import { DatabaseService } from '../service/database.service';

interface MarkerInfos {
  marker: L.Marker;
  address: string;
  nameList: string[];
}

export interface MarkerData {
  name: string;
  address: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MapFormComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private readonly allMakers: Map<string, MarkerInfos> = new Map();

  constructor(private databaseService: DatabaseService) { }

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    const defaultLocation = new L.Point(46.96855, 2.62579);
    const defaultZoom = 5.5;
    const osmURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const osmAttribution =
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';

    this.map = L.map("map", { zoomSnap: 0.25 }).setView(
      [defaultLocation.x, defaultLocation.y],
      defaultZoom
    );

    // Add classic map view
    L.tileLayer(osmURL, {
      maxZoom: 19,
      minZoom: 2,
      attribution: osmAttribution,
    }).addTo(this.map);

    // Set max bounds for the map
    const bounds = L.latLngBounds(L.latLng(-75, -180), L.latLng(90, 180));
    this.map.setMaxBounds(bounds); // Set the maximum bounds for the map

    // Disable dragging of the map outside the bounds
    this.map.on("drag", () => {
      this.map.panInsideBounds(bounds, { animate: false });
    });

    // Request User's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.map.setView(
          [position.coords.latitude, position.coords.longitude],
          13
        );
      },
      () => {
        console.warn("Geolocation is not supported or user refused it");
      }
    );

    this.map.zoomControl.remove();
  }

  // Instanciate the existing markers from the database
  public initMarkers(): void {
    this.databaseService.getAllMarkers().then((docs) => {
      docs.forEach((doc) => {
        if (doc.exists()) {
          const data = doc.data() as MarkerData;
          this.addMarker(data);
        }
      })
    });
  }

  private addMarker(data: MarkerData): void {
    const positionKey = JSON.stringify({ x: data.x, y: data.y });

    if (this.allMakers.has(positionKey)) {
      this.updateMarker(positionKey, data);
    } else {
      this.createNewMarker(positionKey, data);
    }
  }

  private updateMarker(key: string, data: MarkerData) {
    const markerInfos = this.allMakers.get(key)!;

    // Update marker icon
    markerInfos.nameList.push(data.name);
    const markerIcon = markerInfos.marker.getIcon() as L.DivIcon;
    markerIcon.options.html = getIconHtml(
      markerInfos.nameList.length.toString()
    );
    markerInfos.marker.setIcon(markerIcon);

    // Update popup content
    const newContent = getPopupHtml(data.address, markerInfos.nameList.join(", "));
    markerInfos.marker.setPopupContent(newContent);
  }

  private createNewMarker(key: string, data: MarkerData) {
    const markerIcon = getIconHtml("");
    const marker = L.marker([data.x, data.y], {
      icon: L.divIcon({
        className: "custom-marker",
        html: markerIcon,
        iconAnchor: iconOptions.iconAnchor,
      })
    }).addTo(this.map);
    this.allMakers.set(key, { marker, address: data.address, nameList: [data.name] });
    
    // Set the popup content
    const content = getPopupHtml(data.address, data.name);
    marker.bindPopup(content, { className: "custom-popup" });
  }

  public handleAddMarkerEvent(data: MarkerData): void {
    this.addMarker(data);
    this.databaseService.addMarker(data);
  }
}

const iconOptions = {
  iconSize: [25, 35],
  iconAnchor: new L.Point(19, 35),
};

function getIconHtml(number: string): string {
  const iconUri = `assets/marker_red${number === "" ? "" : "_full"}.png`;

  return `<img src="${iconUri}" width="${iconOptions.iconSize[0]}" height="${iconOptions.iconSize[1]}"/>
	<div class="marker-number">${number}</div>`;
}

function getPopupHtml(address: string, nameList: string): string {
  return `
    <h4>${address}</h4>
    <hr />
    <p class="popup-desc">${nameList}</p>
  `;
  // <input type="button" class="popup-button" value="Discussion" />
}