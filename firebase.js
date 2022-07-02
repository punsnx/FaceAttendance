import { initializeApp } from 'firebase/app';
initializeApp = require("firebase/app");

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBsCo681SGWjfUKJkPkWakgPq3QiOrtj3A",
    authDomain: "skfaceattendance.firebaseapp.com",
    projectId: "skfaceattendance",
    storageBucket: "gs://skfaceattendance.appspot.com/",
    messagingSenderId: "1032557262506",
    appId: "1:1032557262506:web:65cf8afd6f7e1ceec7c2d3",
    measurementId: "G-JBY5S46NM1"
  };

const app = initializeApp(firebaseConfig);


