import { initializeApp } from "firebase/app";
import {
  doc,
  getDoc,
  getFirestore,
  increment,
  updateDoc,
} from "firebase/firestore";

/**
 * Non-secret unique firebase config
 */
const firebaseConfig = {
  apiKey: "AIzaSyAma45r8JQY5Y79G4GjbBmJbO75FKv5gVQ",
  authDomain: "page-counter-361ab.firebaseapp.com",
  projectId: "page-counter-361ab",
  storageBucket: "page-counter-361ab.firebasestorage.app",
  messagingSenderId: "1004044281892",
  appId: "1:1004044281892:web:e04cfaa22999f4b37c50b1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const pageViewDoc = doc(db, "cacodemon", "pageviews");
const rollCountDoc = doc(db, "cacodemon", "rollcount");

export async function getRollCount(): Promise<number | undefined> {
  return (await getDoc(rollCountDoc)).data()?.count;
}

export async function incrementRollCount(): Promise<void> {
  updateDoc(rollCountDoc, {
    count: increment(1),
  });
}

export async function incrementPageViews(): Promise<void> {
  updateDoc(pageViewDoc, {
    count: increment(1),
  });
}
