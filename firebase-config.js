// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyClvJWt2IxzrQfAIGxW_gsi3ENpkOHyJsQ",
    authDomain: "futbolxperience-cca9d.firebaseapp.com",
    projectId: "futbolxperience-cca9d",
    storageBucket: "futbolxperience-cca9d.firebasestorage.app",
    messagingSenderId: "484478946928",
    appId: "1:484478946928:web:929d1277827e9ef795eeb5",
    measurementId: "G-HV2BF5W6K7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);