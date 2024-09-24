import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  type CollectionReference,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { signInAnonymously, getAuth } from "firebase/auth";
import { MarkerData } from '../map/map.component';
import { ToastService } from './toast.service';

const firebaseConfig = {
  authDomain: "carte-bde-373d7.firebaseapp.com",
  projectId: "carte-bde-373d7",
  storageBucket: "carte-bde-373d7.appspot.com",
  messagingSenderId: "981295285127",
  appId: "1:981295285127:web:bc0d3f7fda264ae3a40922",
  databaseURL:
    "https://carte-bde-373d7-default-rtdb.europe-west1.firebasedatabase.app",
};

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private markersCollection: CollectionReference | null = null;

  constructor(private toastService: ToastService) {}

  async initApp(apiKey: string): Promise<void> {
    // Initialize Firebase
    const appConfig = { ...firebaseConfig, apiKey }

    const app = initializeApp(appConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);

    // Sign in anonymously
    await signInAnonymously(auth)

    // Set the markers collection
    this.markersCollection = collection(firestore, "markers");
  }

  // Example function to fetch data from Firebase
  async getAllMarkers(): Promise<QueryDocumentSnapshot[]> {
    return getDocs(this.markersCollection!).then((querySnapshot) => {
      return querySnapshot.docs;
    });
  }

  // Example function to post data to Firebase
  async addMarker(data: MarkerData): Promise<void> {
    await addDoc(this.markersCollection!, data).then(() => {
      this.toastService.addToast("success", "Votre position a bien étée ajoutée", 5000);
    }).catch((error) => {
      this.toastService.addToast("error", `Une erreur est survenue : \n${error.message}`, 5000);
    });
  }
}
