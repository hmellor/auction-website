import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAYOYDuMKGGjTSJL5uDzG5hjQ6y_vYPiI",
  authDomain: "auction-website-b12fc.firebaseapp.com",
  databaseURL: "https://auction-website-b12fc.firebaseio.com",
  projectId: "auction-website-b12fc",
  storageBucket: "auction-website-b12fc.appspot.com",
  messagingSenderId: "791747024664",
  appId: "1:791747024664:web:215a222a81c6d0c2aeb06d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
