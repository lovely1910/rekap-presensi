import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKQjuExFWNIDy_I8yakhEy1RytJzer4dM",
  authDomain: "bmbabsens.firebaseapp.com",
  projectId: "bmbabsens",
  storageBucket: "bmbabsens.firebasestorage.app",
  messagingSenderId: "843800445037",
  appId: "1:843800445037:android:0d0621aff761324e957f64"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
