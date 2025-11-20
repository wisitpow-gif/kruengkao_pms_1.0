import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXRW2dbaY9iNI7tOcl6ApprSbH3byxl08",
  authDomain: "kruengkao-pms.firebaseapp.com",
  projectId: "kruengkao-pms",
  storageBucket: "kruengkao-pms.firebasestorage.app",
  messagingSenderId: "469724141740",
  appId: "1:469724141740:web:483d0f6a07bf02c58aa709",
  measurementId: "G-VZ8CYV7G2T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;