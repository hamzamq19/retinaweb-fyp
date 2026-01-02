// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkn6DnpEr9pBfWcH9b-QFQwt1wvqlueV8",
  authDomain: "retinaai-41045.firebaseapp.com",
  projectId: "retinaai-41045",
  storageBucket: "retinaai-41045.firebasestorage.app",
  messagingSenderId: "455781539118",
  appId: "1:455781539118:web:c25b4859c0d889d2442ebf",
  measurementId: "G-7XBWHWQJ9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);