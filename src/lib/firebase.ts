// File: C:\Users\PMYLS\Desktop\Mahendar Website\Admin-Dashboard-for-Kidz-Zone (2)\kidz-zone-admin\src\lib\firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZVV35MNDjEJTrKMsHvDdCm0CNW63XUZ4",
  authDomain: "new-project-f8d5e.firebaseapp.com",
  projectId: "new-project-f8d5e",
  storageBucket: "new-project-f8d5e.appspot.com", // 🔁 Fixed storage bucket URL
  messagingSenderId: "284483723352",
  appId: "1:284483723352:web:1db28c1ed16afd4ebf2a2d",
  measurementId: "G-TX0N65L84C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };