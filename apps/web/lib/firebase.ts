import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCC_qD4BT6XZyYJG1vL82oSggnC0F0cjNw",
  authDomain: "medieval-chess.firebaseapp.com",
  projectId: "medieval-chess",
  storageBucket: "medieval-chess.firebasestorage.app",
  messagingSenderId: "525897312032",
  appId: "1:525897312032:web:58efedc499b55268115945",
  measurementId: "G-E8CNT27EW9",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
