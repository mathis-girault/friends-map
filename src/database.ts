import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  type CollectionReference,
} from "firebase/firestore";
import {
  type DatabaseReference,
  type Unsubscribe,
  getDatabase,
  ref,
  child,
  set,
  onValue,
} from "firebase/database";
import { signInAnonymously, getAuth } from "firebase/auth";
import { getPosFromAdress } from "./utils";
import { type MapFunctionAddUser } from "./types";

const firebaseConfig = {
  apiKey: `${process.env.API_KEY}`,
  authDomain: "carte-bde-373d7.firebaseapp.com",
  projectId: "carte-bde-373d7",
  storageBucket: "carte-bde-373d7.appspot.com",
  messagingSenderId: "981295285127",
  appId: "1:981295285127:web:bc0d3f7fda264ae3a40922",
  databaseURL:
    "https://carte-bde-373d7-default-rtdb.europe-west1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

export default class Database {
  private readonly mapFunctionAddUser: MapFunctionAddUser;
  private readonly usersCollection: CollectionReference = collection(
    firestore,
    "users"
  );

  private readonly discussionRef: DatabaseReference = ref(
    database,
    "discussions"
  );

  constructor(mapFunction: MapFunctionAddUser) {
    this.mapFunctionAddUser = mapFunction;
  }

  async signIn(): Promise<void> {
    await signInAnonymously(auth)
      .then((userCredential) => {
        // The user is signed in anonymously
        console.log("Anonymous user ID:", userCredential.user.uid);
      })
      .catch((error) => {
        // Handle any errors that occur during anonymous sign-in
        console.error("Anonymous sign-in error:", error.message);
      });
  }

  async initDB(): Promise<void> {
    await getDocs(this.usersCollection).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // Assert document exists and is conform to the expected format
        if (!doc.exists()) {
          console.log("Document not existing!?");
          return;
        }
        if (
          doc.data().x === undefined ||
          doc.data().y === undefined ||
          doc.data().group === undefined ||
          doc.data().city === undefined ||
          doc.data().name === undefined
        ) {
          console.log(
            `Document data not conform to the expected format: ${JSON.stringify(
              doc.data()
            )}}`
          );
          return;
        }

        // console.log(`${doc.id} => ${doc.data()}`);
        this.mapFunctionAddUser(
          doc.data().x as number,
          doc.data().y as number,
          doc.data().group as string,
          doc.data().city as string,
          doc.data().name as string
        );
      });
      console.log("All users retrieved successfully");
    });
  }

  addUser(name: string, city: string, group: string): void {
    console.log("Adding new user...");
    if (
      typeof name !== "string" &&
      typeof city !== "string" &&
      typeof group !== "string"
    ) {
      console.log("Un des champs est invalide");
      return;
    }

    getPosFromAdress(city)
      .then((pos) => {
        addDoc(this.usersCollection, {
          name,
          city,
          group,
          x: pos.x,
          y: pos.y,
        })
          .then((docRef) => {
            console.log("User added with ID: ", docRef.id);
            this.mapFunctionAddUser(pos.x, pos.y, group, city, name);
          })
          .catch((error) => {
            console.error("Error adding user: ", error);
          });
      })
      .catch((error) => {
        console.error("Error getting position: ", error);
      });
  }

  openDiscussion(
    city: string,
    group: string,
    callback: (error: Error | null, discussionText: string) => void
  ): Unsubscribe {
    const myDiscussionRef = child(child(this.discussionRef, city), group);

    const unsubscriber = onValue(myDiscussionRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(null, snapshot.val().text as string);
      } else {
        console.log("Creating new discussion");
        set(myDiscussionRef, { text: "" })
          .then(() => {
            callback(null, "");
          })
          .catch((error: Error) => {
            console.error("Error creating new discussion:", error);
            callback(error, "");
          });
      }
    });

    return unsubscriber;
  }

  storeDiscussion(city: string, group: string, text: string): void {
    set(child(child(this.discussionRef, city), group), { text })
      .then(() => {
        console.log("Text updated successfully");
      })
      .catch((error) => {
        console.log("Error updating text:", error);
      });
  }
}
