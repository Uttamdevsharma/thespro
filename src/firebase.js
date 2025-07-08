// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCutN58DUiTd0Crv-s8Qi1iaS2FHwcmcjA",
  authDomain: "thesis-project-management.firebaseapp.com",
  projectId: "thesis-project-management",
  storageBucket: "thesis-project-management.appspot.com",
  messagingSenderId: "611526694898",
  appId: "1:611526694898:web:22a626c27c504cd86cfd6b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
