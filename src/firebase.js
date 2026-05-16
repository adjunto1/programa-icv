import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAuva1NIWiRO29jluYKrgjuUnGSgbAgQbs",
  authDomain: "programa-icv.firebaseapp.com",
  databaseURL: "https://programa-icv-default-rtdb.firebaseio.com",
  projectId: "programa-icv",
  storageBucket: "programa-icv.firebasestorage.app",
  messagingSenderId: "532656820853",
  appId: "1:532656820853:web:f703c9c61ccbc438619e3c",
  measurementId: "G-7ZJ62LBFVH"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
