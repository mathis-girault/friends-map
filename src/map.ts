import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { iconOptions, getIconHtml, listCategories } from "./utils";
import { type DiscussionViewHandler, type MarkerInfos } from "./types";

export default class MapManager {
  private myMap: L.Map;
  private readonly allMakers: Record<string, Map<L.Point, MarkerInfos>> = {};
  private readonly allLayersGroups: Record<string, L.LayerGroup> = {};
  private openedPopup: L.Popup | null = null;
  private currentGroup: string;

  private discussionViewHandler: DiscussionViewHandler;

  constructor() {
    for (const group of listCategories) {
      this.allLayersGroups[group] = L.layerGroup();
      this.allMakers[group] = new Map();
    }
  }

  setDiscussionViewHandler(discussionViewHandler: DiscussionViewHandler): void {
    this.discussionViewHandler = discussionViewHandler;
  }

  initMap(): void {
    const defaultLocation = new L.Point(46.96855, 2.62579);
    const defaultZoom = 5.5;
    const osmURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const osmAttribution =
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';

    this.myMap = L.map("map", { zoomSnap: 0.25 }).setView(
      [defaultLocation.x, defaultLocation.y],
      defaultZoom
    );

    // Add classic map view
    L.tileLayer(osmURL, {
      maxZoom: 19,
      minZoom: 2,
      attribution: osmAttribution,
    }).addTo(this.myMap);

    // Set max bounds for the map
    const bounds = L.latLngBounds(L.latLng(-75, -180), L.latLng(90, 180));
    this.myMap.setMaxBounds(bounds); // Set the maximum bounds for the map

    // Disable dragging of the map outside the bounds
    this.myMap.on("drag", () => {
      this.myMap.panInsideBounds(bounds, { animate: false });
    });

    // Request User's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.myMap.setView(
          [position.coords.latitude, position.coords.longitude],
          13
        );
      },
      () => {
        console.warn("Geolocation is not supported or user refused it");
      }
    );
  }

  createMarker(location: L.Point, group: string, iconHtml: string): L.Marker {
    const marker = L.marker([location.x, location.y], {
      icon: L.divIcon({
        className: "custom-marker",
        html: iconHtml,
        iconAnchor: iconOptions.iconAnchor,
      }),
    });

    marker.addTo(this.allLayersGroups[group]);
    return marker;
  }

  registerNewPerson(
    x: number,
    y: number,
    group: string,
    city: string,
    name: string
  ): void {
    const position = new L.Point(x, y);

    // If the position already exists
    for (const point of this.allMakers[group].keys()) {
      if (point.equals(position)) {
        const markerInfos = this.allMakers[group].get(point);
        if (markerInfos === undefined) {
          console.error("Marker not found");
          return;
        }

        markerInfos.nameList.push(name);
        const markerIcon = markerInfos.marker.getIcon() as L.DivIcon;
        markerIcon.options.html = getIconHtml(
          group,
          markerInfos.nameList.length.toString()
        );
        markerInfos.marker.setIcon(markerIcon);
        return;
      }
    }

    // Otherwise, create a new marker
    const marker = this.createMarker(position, group, getIconHtml(group, ""));
    marker.addEventListener("click", () => {
      this.clickOnMarker(group, position);
    });
    this.allMakers[group].set(position, { marker, city, nameList: [name] });
  }

  clickOnMarker(group: string, position: L.Point): void {
    // Check if we do have the discussion handler
    if (this.discussionViewHandler === null) {
      console.error("No discussion handler set");
      return;
    }

    const currentMarkerObj = this.allMakers[group].get(position);
    if (currentMarkerObj === undefined) {
      console.error("Marker not found");
      return;
    }

    const content = `
        <h3>${currentMarkerObj.city} - ${group}</h3>
        <p class="popup-desc">${currentMarkerObj.nameList.join(", ")}</p>
        <input type="button" class="popup-button" value="Discussion" />
      `;

    const popup = L.popup({
      className: group.replace(" ", "-").toLowerCase(),
    })
      .setLatLng(currentMarkerObj.marker.getLatLng())
      .setContent(content)
      .openOn(this.myMap);

    const popupButton = popup.getElement()?.querySelector(".popup-button");
    popupButton?.addEventListener("click", () => {
      this.discussionViewHandler(currentMarkerObj.city, group);
    });

    this.openedPopup = popup;
  }

  displayMarkers(): void {
    this.openedPopup?.remove();

    for (const [group, layer] of Object.entries(this.allLayersGroups)) {
      if (group === this.currentGroup) {
        layer.addTo(this.myMap);
      } else {
        layer.removeFrom(this.myMap);
      }
    }
  }

  changeGroup(group: string): void {
    this.currentGroup = group;
    this.displayMarkers();
  }
}
